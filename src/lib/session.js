import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";

// Two separate cookies so a patient session can never act as an admin session.
const PATIENT_COOKIE = "cch_session";
const ADMIN_COOKIE = "cch_admin_session";

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

const isProd = process.env.NODE_ENV === "production";

async function sign(payload, maxAgeSeconds) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(key());
}

async function read(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

/* ---------- Patients ---------- */

export async function createPatientSession(userId, remember = false) {
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
  const token = await sign({ sub: userId, kind: "patient" }, maxAge);
  const jar = await cookies();
  jar.set(PATIENT_COOKIE, token, cookieOptions(maxAge));
}

export async function destroyPatientSession() {
  const jar = await cookies();
  jar.delete(PATIENT_COOKIE);
}

/** Returns the current patient or null. Always re-checks the database so a
 *  disabled account loses access immediately. */
export async function getCurrentUser() {
  const jar = await cookies();
  const payload = await read(jar.get(PATIENT_COOKIE)?.value);
  if (!payload || payload.kind !== "patient") return null;
  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, fullName: true, email: true, address: true, phone: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return user;
}

/* ---------- Admins ---------- */

export async function createAdminSession(adminId) {
  const maxAge = 60 * 60 * 4; // admins get shorter sessions
  const token = await sign({ sub: adminId, kind: "admin" }, maxAge);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, cookieOptions(maxAge));
}

export async function destroyAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function getCurrentAdmin() {
  const jar = await cookies();
  const payload = await read(jar.get(ADMIN_COOKIE)?.value);
  if (!payload || payload.kind !== "admin") return null;
  const admin = await db.admin.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  if (!admin || !admin.isActive) return null;
  return admin;
}
