import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { profileSchema, fieldErrors } from "@/lib/validation";
import { sameOrigin } from "@/lib/security";

/**
 * Patients can change their name, address and phone here.
 * Email and password are sensitive account credentials, so they are NOT editable
 * through this route. Changing them needs a re-authentication flow (see README).
 */
export async function PUT(req) {
  if (!(await sameOrigin())) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });
  }

  await db.user.update({ where: { id: user.id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}
