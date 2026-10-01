import { NextResponse } from "next/server";
import { getCurrentAdmin } from "./session";
import { sameOrigin } from "./security";

/**
 * Every admin API route calls this first. It enforces, on the SERVER:
 *   1. same-origin request (CSRF defence for state-changing calls)
 *   2. a valid, active admin session
 *   3. optionally a required role
 *
 * Usage:
 *   const g = await guard();            // any admin
 *   const g = await guard("SUPER_ADMIN"); // super admins only
 *   if (g.error) return g.error;
 *   const admin = g.admin;
 */
export async function guard(requiredRole, { mutating = true } = {}) {
  if (mutating && !(await sameOrigin())) {
    return { error: NextResponse.json({ error: "Request blocked." }, { status: 403 }) };
  }

  const admin = await getCurrentAdmin();
  if (!admin) {
    return { error: NextResponse.json({ error: "Not authorised." }, { status: 401 }) };
  }

  if (requiredRole && admin.role !== requiredRole) {
    return { error: NextResponse.json({ error: "You do not have permission to do that." }, { status: 403 }) };
  }

  return { admin };
}
