import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidWebhookSignature, settleDonation } from "@/lib/paystack";

// Paystack calls this URL server-to-server. Set it in your Paystack dashboard:
//   https://YOUR-DOMAIN/api/paystack/webhook
export async function POST(req) {
  // The signature is computed over the exact raw bytes, so read text, not JSON.
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!isValidWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload." }, { status: 400 });
  }

  // Only charge events matter for donations.
  if (event?.event !== "charge.success" && event?.event !== "charge.failed") {
    return NextResponse.json({ ok: true });
  }

  const reference = event?.data?.reference;
  const eventId = event?.data?.id ? `paystack:${event.event}:${event.data.id}` : null;
  if (!reference) return NextResponse.json({ ok: true });

  // Skip events we have already handled.
  if (eventId) {
    const seen = await db.webhookEvent.findUnique({ where: { id: eventId } });
    if (seen) return NextResponse.json({ ok: true, duplicate: true });
  }

  // Do NOT trust the webhook body for status or amount. settleDonation() asks Paystack
  // directly and compares against the amount we stored before payment.
  await settleDonation(reference);

  if (eventId) {
    await db.webhookEvent
      .create({ data: { id: eventId, provider: "paystack" } })
      .catch(() => {}); // a parallel duplicate may have won the race; that is fine
  }

  return NextResponse.json({ ok: true });
}
