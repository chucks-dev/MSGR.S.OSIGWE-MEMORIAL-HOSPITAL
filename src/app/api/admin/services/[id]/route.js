import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";
import { audit } from "@/lib/security";
import { saveImage, removeImage } from "@/lib/upload";
import { serviceSchema, fieldErrors } from "@/lib/validation";

export async function PUT(req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const existing = await db.service.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Service not found." }, { status: 404 });

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

  // The slug is left unchanged on edit so existing links keep working.
  await db.service.update({
    where: { id },
    data: { ...parsed.data, ...(img.url ? { imageUrl: img.url } : {}) },
  });
  if (img.url) await removeImage(existing.imageUrl);

  await audit(g.admin.id, "SERVICE_UPDATED", "Service", id, parsed.data.name);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const body = await req.json().catch(() => null);
  if (typeof body?.isActive !== "boolean") {
    return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  }
  const exists = await db.service.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Service not found." }, { status: 404 });

  await db.service.update({ where: { id }, data: { isActive: body.isActive } });
  await audit(g.admin.id, body.isActive ? "SERVICE_ACTIVATED" : "SERVICE_DEACTIVATED", "Service", id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const existing = await db.service.findUnique({
    where: { id },
    include: { _count: { select: { appointments: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Service not found." }, { status: 404 });

  // Appointments reference services, so a service with history is deactivated, not deleted.
  if (existing._count.appointments > 0) {
    return NextResponse.json(
      { error: "This service has appointment history, so it cannot be deleted. Deactivate it instead." },
      { status: 409 }
    );
  }

  await db.service.delete({ where: { id } });
  await removeImage(existing.imageUrl);
  await audit(g.admin.id, "SERVICE_DELETED", "Service", id, existing.name);
  return NextResponse.json({ ok: true });
}
