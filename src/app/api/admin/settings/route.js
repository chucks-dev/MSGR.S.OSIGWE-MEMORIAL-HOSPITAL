import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";
import { audit } from "@/lib/security";
import { SETTING_FIELDS } from "@/lib/settings";

export async function PUT(req) {
  const g = await guard();
  if (g.error) return g.error;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const errors = {};
  const updates = [];

  for (const field of SETTING_FIELDS) {
    if (!(field.key in body)) continue;
    const value = String(body[field.key] ?? "").trim();
    if (value.length > 4000) {
      errors[field.key] = "This is too long.";
      continue;
    }
    // Links must be real http(s) URLs so nobody can store a javascript: link.
    const isUrl = ["mapEmbedUrl", "facebook", "instagram", "x"].includes(field.key);
    if (isUrl && value) {
      try {
        const u = new URL(value);
        if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
      } catch {
        errors[field.key] = "Enter a full link starting with https://";
        continue;
      }
    }
    updates.push({ key: field.key, value });
  }

  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  await db.$transaction(
    updates.map((u) =>
      db.siteSetting.upsert({ where: { key: u.key }, create: u, update: { value: u.value } })
    )
  );

  await audit(g.admin.id, "SETTINGS_UPDATED", "SiteSetting", null, `${updates.length} fields`);
  return NextResponse.json({ ok: true });
}
