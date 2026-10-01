import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loginSchema, fieldErrors } from "@/lib/validation";
import {
  verifyPassword,
  burnPasswordTime,
  rateLimit,
  clearRateLimit,
  clientIp,
  sameOrigin,
} from "@/lib/security";
import { createPatientSession } from "@/lib/session";

const GENERIC = "The email or password is incorrect.";

export async function POST(req) {
  if (!(await sameOrigin())) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });
  }
  const { email, password, remember } = parsed.data;

  // Limit per IP and per email, so one attacker cannot hammer one account
  // and one account cannot be locked out by spraying from many IPs for long.
  const ip = await clientIp();
  const byIp = await rateLimit(`login-ip:${ip}`, 20, 15 * 60);
  const byEmail = await rateLimit(`login-email:${email}`, 8, 15 * 60);
  if (!byIp.ok || !byEmail.ok) {
    const retryAfter = Math.max(byIp.retryAfter, byEmail.retryAfter);
    return NextResponse.json(
      { error: "Too many login attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    await burnPasswordTime(password);
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }

  if (!user.isActive) {
    return NextResponse.json(
      { error: "This account has been disabled. Please contact the hospital." },
      { status: 403 }
    );
  }

  await clearRateLimit(`login-email:${email}`);
  await createPatientSession(user.id, remember);
  return NextResponse.json({ ok: true, redirect: "/portal" });
}
