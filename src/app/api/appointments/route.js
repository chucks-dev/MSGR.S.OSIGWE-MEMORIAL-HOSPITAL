import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { appointmentSchema, fieldErrors } from "@/lib/validation";
import { rateLimit, sameOrigin } from "@/lib/security";

export async function POST(req) {
  if (!(await sameOrigin())) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to book an appointment." }, { status: 401 });
  }

  const limit = await rateLimit(`appt:${user.id}`, 10, 60 * 60);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You have made several bookings recently. Please try again later." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });
  }
  const d = parsed.data;

  // Confirm the chosen service and doctor really exist and are active.
  const service = await db.service.findFirst({ where: { id: d.serviceId, isActive: true } });
  if (!service) {
    return NextResponse.json({ errors: { serviceId: "That service is not available." } }, { status: 422 });
  }
  if (d.doctorId) {
    const doctor = await db.doctor.findFirst({ where: { id: d.doctorId, isActive: true } });
    if (!doctor) {
      return NextResponse.json({ errors: { doctorId: "That doctor is not available." } }, { status: 422 });
    }
  }

  const appointment = await db.appointment.create({
    data: {
      userId: user.id,
      serviceId: d.serviceId,
      doctorId: d.doctorId,
      preferredDate: new Date(d.preferredDate),
      preferredTime: d.preferredTime,
      reason: d.reason,
      message: d.message,
      status: "PENDING",
    },
    select: { id: true },
  });

  await db.notification.create({
    data: {
      userId: user.id,
      title: "Appointment request received",
      body: `Your request for ${service.name} is pending. We will confirm it shortly.`,
    },
  });

  return NextResponse.json({ ok: true, id: appointment.id }, { status: 201 });
}
