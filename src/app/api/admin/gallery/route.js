import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";
import { audit } from "@/lib/security";
import { saveImage } from "@/lib/upload";
import { galleryImageSchema, fieldErrors } from "@/lib/validation";

export async function POST(req) {
  const g = await guard();
  if (g.error) return g.error;

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = galleryImageSchema.safeParse({
    caption: form.get("caption"),
    category: form.get("category"),
  });
  if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });

  const file = form.get("image");
  if (!file || typeof file === "string" || file.size === 0) {
    return NextResponse.json({ errors: { image: "Choose an image to upload." } }, { status: 422 });
  }
  const img = await saveImage(file);
  if (img.error) return NextResponse.json({ errors: { image: img.error } }, { status: 422 });

  const created = await db.galleryImage.create({ data: { ...parsed.data, imageUrl: img.url } });
  await audit(g.admin.id, "GALLERY_UPLOADED", "GalleryImage", created.id, parsed.data.caption);
  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}
