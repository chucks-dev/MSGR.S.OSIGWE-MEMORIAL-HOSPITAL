import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";
import { audit } from "@/lib/security";
import { removeImage } from "@/lib/upload";
import { galleryImageSchema, fieldErrors } from "@/lib/validation";

export async function PATCH(req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const parsed = galleryImageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });

  const exists = await db.galleryImage.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Image not found." }, { status: 404 });

  await db.galleryImage.update({ where: { id }, data: parsed.data });
  await audit(g.admin.id, "GALLERY_UPDATED", "GalleryImage", id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const existing = await db.galleryImage.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Image not found." }, { status: 404 });

  await db.galleryImage.delete({ where: { id } });
  await removeImage(existing.imageUrl);
  await audit(g.admin.id, "GALLERY_DELETED", "GalleryImage", id);
  return NextResponse.json({ ok: true });
}
