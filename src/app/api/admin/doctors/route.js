import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";
import { audit } from "@/lib/security";
import { saveImage } from "@/lib/upload";
import { doctorSchema, fieldErrors } from "@/lib/validation";

export async function POST(req) {
  const g = await guard();
  if (g.error) return g.error;

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

  const doctor = await db.doctor.create({ data: { ...parsed.data, photoUrl: img.url } });
  await audit(g.admin.id, "DOCTOR_CREATED", "Doctor", doctor.id, doctor.name);
  return NextResponse.json({ ok: true, id: doctor.id }, { status: 201 });
}
