import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";
import { audit } from "@/lib/security";
import { saveImage, removeImage } from "@/lib/upload";
import { articleSchema, fieldErrors } from "@/lib/validation";

export async function PUT(req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Article not found." }, { status: 404 });

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

  await db.article.update({
    where: { id },
    data: { ...parsed.data, ...(img.url ? { imageUrl: img.url } : {}) },
  });
  if (img.url) await removeImage(existing.imageUrl);

  await audit(g.admin.id, "ARTICLE_UPDATED", "Article", id, parsed.data.title);
  return NextResponse.json({ ok: true });
}

/** PATCH publishes or unpublishes. */
export async function PATCH(req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  if (typeof body?.isPublished !== "boolean") {
    return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  }
  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Article not found." }, { status: 404 });

  await db.article.update({
    where: { id },
    data: {
      isPublished: body.isPublished,
      // Keep the original publish date if it was already published once.
      publishedAt: body.isPublished ? existing.publishedAt ?? new Date() : existing.publishedAt,
    },
  });
  await audit(g.admin.id, body.isPublished ? "ARTICLE_PUBLISHED" : "ARTICLE_UNPUBLISHED", "Article", id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Article not found." }, { status: 404 });

  await db.article.delete({ where: { id } });
  await removeImage(existing.imageUrl);
  await audit(g.admin.id, "ARTICLE_DELETED", "Article", id, existing.title);
  return NextResponse.json({ ok: true });
}
