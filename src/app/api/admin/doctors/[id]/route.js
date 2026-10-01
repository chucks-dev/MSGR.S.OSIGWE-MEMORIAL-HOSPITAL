import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";
import { audit } from "@/lib/security";
import { saveImage, removeImage } from "@/lib/upload";
import { doctorSchema, fieldErrors } from "@/lib/validation";

export async function PUT(req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const existing = await db.doctor.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const parsed = doctorSchema.safeParse({
    name: form.get("name"),
    position: form.get("position"),
    specialization: form.get("specialization"),
    bio: form.get("bio"),
  });
  if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });

  const img = await saveImage(form.get("photo"));
  if (img.error) return NextResponse.json({ errors: { photo: img.error } }, { status: 422 });

  await db.doctor.update({
    where: { id },
    data: { ...parsed.data, ...(img.url ? { photoUrl: img.url } : {}) },
  });
  if (img.url) await removeImage(existing.photoUrl);

  await audit(g.admin.id, "DOCTOR_UPDATED", "Doctor", id, parsed.data.name);
  return NextResponse.json({ ok: true });
}

/** PATCH toggles active/inactive (soft removal from the public site). */
export async function PATCH(req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  if (typeof body?.isActive !== "boolean") {
    return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  }
  const exists = await db.doctor.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  await db.doctor.update({ where: { id }, data: { isActive: body.isActive } });
  await audit(g.admin.id, body.isActive ? "DOCTOR_ACTIVATED" : "DOCTOR_DEACTIVATED", "Doctor", id);
  return NextResponse.json({ ok: true });
}

/** DELETE permanently removes. Past appointments keep working (doctor set to null). */
export async function DELETE(_req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const existing = await db.doctor.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  await db.doctor.delete({ where: { id } });
  await removeImage(existing.photoUrl);
  await audit(g.admin.id, "DOCTOR_DELETED", "Doctor", id, existing.name);
  return NextResponse.json({ ok: true });
}
