import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { db } from "./db";

/* ---------- Passwords ---------- */

const ROUNDS = 12;

export function hashPassword(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// A real hash of a throwaway string. Used so login takes similar time whether or
// not the email exists, which stops attackers from discovering registered emails.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", ROUNDS);
export async function burnPasswordTime(plain) {
  await bcrypt.compare(plain, DUMMY_HASH);
}

/* ---------- Client IP ---------- */

export async function clientIp() {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

/* ---------- Rate limiting (database-backed) ---------- */

/**
 * Allows `limit` hits per `windowSeconds` for a given key.
 * Returns { ok: boolean, retryAfter: seconds }.
 */
export async function rateLimit(key, limit, windowSeconds) {
  const now = new Date();
  const windowMs = windowSeconds * 1000;

  const row = await db.rateLimit.findUnique({ where: { key } });

  if (!row || now.getTime() - row.windowStart.getTime() >= windowMs) {
    await db.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return { ok: true, retryAfter: 0 };
  }

  if (row.count >= limit) {
    const retryAfter = Math.ceil((windowMs - (now.getTime() - row.windowStart.getTime())) / 1000);
    return { ok: false, retryAfter };
  }

  await db.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return { ok: true, retryAfter: 0 };
}

export async function clearRateLimit(key) {
  await db.rateLimit.deleteMany({ where: { key } });
}

/* ---------- CSRF (same-origin check for state-changing requests) ---------- */

/**
 * Cookies use SameSite=Lax, and every mutating route also verifies the request
 * came from our own origin. Returns true when the request is safe to process.
 */
export async function sameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("host");
  if (!origin) return false; // browsers always send Origin on POST/PUT/DELETE fetches
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/* ---------- Audit log ---------- */

export async function audit(adminId, action, entity, entityId, detail) {
  try {
    await db.auditLog.create({
      data: {
        adminId,
        action,
        entity,
        entityId: entityId || null,
        detail: detail ? String(detail).slice(0, 500) : null,
        ip: await clientIp(),
      },
    });
  } catch (err) {
    // Never let audit logging break the actual request.
    console.error("audit log failed", err);
  }
}
