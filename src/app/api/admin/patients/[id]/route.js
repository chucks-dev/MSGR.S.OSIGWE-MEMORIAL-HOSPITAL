import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";
import { audit } from "@/lib/security";

const schema = z.object({ isActive: z.boolean() });

export async function PATCH(req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 422 });

  const exists = await db.user.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Patient not found." }, { status: 404 });

  await db.user.update({ where: { id }, data: { isActive: parsed.data.isActive } });
  await audit(g.admin.id, parsed.data.isActive ? "PATIENT_ENABLED" : "PATIENT_DISABLED", "User", id);
  return NextResponse.json({ ok: true });
}
