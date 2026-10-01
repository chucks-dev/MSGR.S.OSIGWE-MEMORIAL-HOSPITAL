import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signupSchema, fieldErrors } from "@/lib/validation";
import { hashPassword, rateLimit, clientIp, sameOrigin } from "@/lib/security";
import { createPatientSession } from "@/lib/session";

export async function POST(req) {
  if (!(await sameOrigin())) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  const ip = await clientIp();
  const limit = await rateLimit(`signup:${ip}`, 5, 60 * 60);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many sign-up attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });
  }
  const { fullName, email, address, phone, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json(
      { errors: { email: "An account with this email already exists. Try logging in." } },
      { status: 409 }
    );
  }

  const user = await db.user.create({
    data: { fullName, email, address, phone, passwordHash: await hashPassword(password) },
    select: { id: true },
  });

  await db.notification.create({
    data: {
      userId: user.id,
      title: "Welcome",
      body: "Your account is ready. You can now book appointments online.",
    },
  });

  await createPatientSession(user.id, false);
  return NextResponse.json({ ok: true, redirect: "/portal" }, { status: 201 });
}
