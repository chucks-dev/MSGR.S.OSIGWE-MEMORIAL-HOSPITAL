import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";
import { audit } from "@/lib/security";
import { saveImage } from "@/lib/upload";
import { articleSchema, fieldErrors, slugify } from "@/lib/validation";

async function uniqueSlug(base) {
  let slug = base || "article";
  let n = 1;
  while (await db.article.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function POST(req) {
  const g = await guard();
  if (g.error) return g.error;

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = articleSchema.safeParse({
    title: form.get("title"),
    category: form.get("category"),
    author: form.get("author"),
    excerpt: form.get("excerpt"),
    content: form.get("content"),
  });
  if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });

  const img = await saveImage(form.get("image"));
  if (img.error) return NextResponse.json({ errors: { image: img.error } }, { status: 422 });

  const publish = form.get("publish") === "true";
  const slug = await uniqueSlug(slugify(parsed.data.title));

  const article = await db.article.create({
    data: {
      ...parsed.data,
      slug,
      imageUrl: img.url,
      isPublished: publish,
      publishedAt: publish ? new Date() : null,
    },
  });
  await audit(g.admin.id, "ARTICLE_CREATED", "Article", article.id, article.title);
  return NextResponse.json({ ok: true, id: article.id }, { status: 201 });
}
