import { NextResponse } from "next/server";
import { destroyPatientSession } from "@/lib/session";
import { sameOrigin } from "@/lib/security";

export async function POST() {
  if (!(await sameOrigin())) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }
  await destroyPatientSession();
  return NextResponse.json({ ok: true, redirect: "/" });
}
