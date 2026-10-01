import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";
import { hashPassword, verifyPassword, audit, rateLimit } from "@/lib/security";
import { passwordRules, fieldErrors } from "@/lib/validation";

// Admin passwords must be stronger than patient passwords.
const strongPassword = passwordRules
  .min(12, "Use at least 12 characters for an admin password.")
  .regex(/[^A-Za-z0-9]/, "Include a symbol, such as ! or #.");

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export async function PUT(req) {
  const g = await guard();
  if (g.error) return g.error;

  const limit = await rateLimit(`admin-pw:${g.admin.id}`, 5, 15 * 60);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many attempts. Please wait and try again." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });

  const admin = await db.admin.findUnique({ where: { id: g.admin.id } });
  const ok = await verifyPassword(parsed.data.currentPassword, admin.passwordHash);
  if (!ok) {
    return NextResponse.json({ errors: { currentPassword: "That is not your current password." } }, { status: 422 });
  }

  await db.admin.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });
  await audit(admin.id, "PASSWORD_CHANGED", "Admin", admin.id);
  return NextResponse.json({ ok: true });
}
