import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";
import { audit } from "@/lib/security";
import { saveImage } from "@/lib/upload";
import { serviceSchema, fieldErrors, slugify } from "@/lib/validation";

async function uniqueSlug(base) {
  let slug = base || "service";
  let n = 1;
  while (await db.service.findUnique({ where: { slug }, select: { id: true } })) {
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

  const parsed = serviceSchema.safeParse({
    name: form.get("name"),
    summary: form.get("summary"),
    description: form.get("description"),
  });
  if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });

  const img = await saveImage(form.get("image"));
  if (img.error) return NextResponse.json({ errors: { image: img.error } }, { status: 422 });

  const slug = await uniqueSlug(slugify(parsed.data.name));
  const service = await db.service.create({ data: { ...parsed.data, slug, imageUrl: img.url } });
  await audit(g.admin.id, "SERVICE_CREATED", "Service", service.id, service.name);
  return NextResponse.json({ ok: true, id: service.id }, { status: 201 });
}
