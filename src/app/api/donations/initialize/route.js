import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { donationSchema, fieldErrors } from "@/lib/validation";
import { rateLimit, clientIp, sameOrigin } from "@/lib/security";
import { initializeTransaction, newReference } from "@/lib/paystack";

export async function POST(req) {
  if (!(await sameOrigin())) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  const ip = await clientIp();
  const limit = await rateLimit(`donate:${ip}`, 10, 60 * 60);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many donation attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = donationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 });
  }
  const d = parsed.data;

  // Anonymous donors are allowed. If someone is logged in, link the donation to them
  // so it shows in their history.
  const user = await getCurrentUser();

  const reference = newReference();
  const amountKobo = d.amountNaira * 100;

  // Save first, as PENDING. The amount stored here is what we later compare against
  // what Paystack reports, so the browser can never change what counts as "paid".
  await db.donation.create({
    data: {
      reference,
      userId: user?.id ?? null,
      donorName: d.donorName,
      donorEmail: d.donorEmail,
      donorPhone: d.donorPhone,
      isAnonymous: d.isAnonymous,
      amountKobo,
      purpose: d.purpose,
      status: "PENDING",
    },
  });

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

  try {
    const tx = await initializeTransaction({
      email: d.donorEmail,
      amountKobo,
      reference,
      callbackUrl: `${siteUrl}/treasury/thanks`,
      metadata: { purpose: d.purpose },
    });
    return NextResponse.json({ ok: true, authorizationUrl: tx.authorization_url, reference });
  } catch (err) {
    console.error("Paystack initialize failed", err);
    await db.donation.update({ where: { reference }, data: { status: "FAILED", gatewayResponse: "initialize failed" } });
    return NextResponse.json(
      { error: "We could not start the payment. Please try again in a moment." },
      { status: 502 }
    );
  }
}
