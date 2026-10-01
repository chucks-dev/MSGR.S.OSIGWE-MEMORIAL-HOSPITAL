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
  audit,
} from "@/lib/security";
import { createAdminSession } from "@/lib/session";

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
  const { email, password } = parsed.data;

  // Much stricter than patient login.
  const ip = await clientIp();
  const byIp = await rateLimit(`admin-login-ip:${ip}`, 10, 15 * 60);
  const byEmail = await rateLimit(`admin-login-email:${email}`, 5, 15 * 60);
  if (!byIp.ok || !byEmail.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait 15 minutes and try again." },
      { status: 429, headers: { "Retry-After": String(Math.max(byIp.retryAfter, byEmail.retryAfter)) } }
    );
  }

  const admin = await db.admin.findUnique({ where: { email } });
  if (!admin) {
    await burnPasswordTime(password);
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid || !admin.isActive) {
    await audit(admin.id, "LOGIN_FAILED", "Admin", admin.id);
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }

  await clearRateLimit(`admin-login-email:${email}`);
  await createAdminSession(admin.id);
  await audit(admin.id, "LOGIN", "Admin", admin.id);

  const base = "/" + (process.env.ADMIN_PATH || "secure-management-portal-x7k29");
  return NextResponse.json({ ok: true, redirect: base });
}
