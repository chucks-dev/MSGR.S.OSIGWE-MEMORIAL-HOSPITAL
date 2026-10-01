import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";

const schema = z
  .object({ isRead: z.boolean().optional(), isArchived: z.boolean().optional() })
  .refine((v) => v.isRead !== undefined || v.isArchived !== undefined, "Nothing to update.");

export async function PATCH(req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 422 });

  const exists = await db.contactMessage.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Message not found." }, { status: 404 });

  await db.contactMessage.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}
