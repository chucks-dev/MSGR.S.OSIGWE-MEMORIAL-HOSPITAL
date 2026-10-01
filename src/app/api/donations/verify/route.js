import { NextResponse } from "next/server";
import { settleDonation } from "@/lib/paystack";
import { rateLimit, clientIp } from "@/lib/security";

export async function GET(req) {
  const ip = await clientIp();
  const limit = await rateLimit(`verify:${ip}`, 30, 10 * 60);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const reference = new URL(req.url).searchParams.get("reference");
  if (!reference || reference.length > 80) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  const result = await settleDonation(reference);
  if (!result.found) {
    return NextResponse.json({ error: "Donation not found." }, { status: 404 });
  }

  // Only return what the thank-you page needs. Never the donor's contact details.
  const d = result.donation;
  return NextResponse.json({
    reference: d.reference,
    status: d.status,
    amountNaira: d.amountKobo / 100,
    purpose: d.purpose,
    pendingCheckFailed: Boolean(result.error),
  });
}
