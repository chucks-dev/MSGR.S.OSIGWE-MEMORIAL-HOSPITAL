import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/session";
import { getCurrentAdmin } from "@/lib/session";
import { audit, sameOrigin } from "@/lib/security";

export async function POST() {
  if (!(await sameOrigin())) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }
  const admin = await getCurrentAdmin();
  if (admin) await audit(admin.id, "LOGOUT", "Admin", admin.id);
  await destroyAdminSession();
  const base = "/" + (process.env.ADMIN_PATH || "secure-management-portal-x7k29");
  return NextResponse.json({ ok: true, redirect: `${base}/login` });
}
