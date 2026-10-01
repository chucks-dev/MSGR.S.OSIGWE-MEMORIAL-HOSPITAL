import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";
import { audit } from "@/lib/security";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
});

const LABEL = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export async function PATCH(req, { params }) {
  const g = await guard();
  if (g.error) return g.error;
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status." }, { status: 422 });

  const existing = await db.appointment.findUnique({
    where: { id },
    include: { service: { select: { name: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });

  const updated = await db.appointment.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  if (existing.status !== updated.status) {
    await db.notification.create({
      data: {
        userId: existing.userId,
        title: `Appointment ${LABEL[updated.status]}`,
        body: `Your ${existing.service.name} appointment is now ${LABEL[updated.status]}.`,
      },
    });
  }

  await audit(g.admin.id, "APPOINTMENT_STATUS", "Appointment", id, `${existing.status} -> ${updated.status}`);
  return NextResponse.json({ ok: true });
}
