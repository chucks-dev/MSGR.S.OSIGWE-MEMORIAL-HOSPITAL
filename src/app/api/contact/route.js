import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { rateLimit, clientIp, sameOrigin } from "@/lib/security";

export async function POST(req) {
  if (!(await sameOrigin())) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  const ip = await clientIp();
  const limit = await rateLimit(`contact:${ip}`, 5, 60 * 60);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You have sent several messages recently. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field, bots usually do.
  if (body && body.website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });
  }

  await db.contactMessage.create({ data: parsed.data });
  return NextResponse.json({ ok: true }, { status: 201 });
}
