import crypto from "crypto";
import { db } from "./db";

const BASE = "https://api.paystack.co";

function secret() {
  const s = process.env.PAYSTACK_SECRET_KEY;
  if (!s) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  return s;
}

async function paystack(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json) {
    const msg = json?.message || `Paystack request failed (${res.status}).`;
    throw new Error(msg);
  }
  return json;
}

/** Generates a reference the client cannot predict or reuse. */
export function newReference() {
  return `CCH-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
}

/** Starts a transaction. Amount is in kobo and comes from OUR database row. */
export async function initializeTransaction({ email, amountKobo, reference, callbackUrl, metadata }) {
  const json = await paystack("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email,
      amount: amountKobo,
      reference,
      currency: "NGN",
      callback_url: callbackUrl,
      metadata,
    }),
  });
  return json.data; // { authorization_url, access_code, reference }
}

export async function fetchTransaction(reference) {
  const json = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`);
  return json.data;
}

/** Verifies the X-Paystack-Signature header against the RAW request body. */
export function isValidWebhookSignature(rawBody, signature) {
  if (!signature) return false;
  const expected = crypto.createHmac("sha512", secret()).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * The ONE function that decides whether a donation is paid.
 * Called from both the redirect-return verify route and the webhook, so the rules
 * live in a single place.
 *
 * It only marks SUCCESSFUL when Paystack itself reports success AND the amount and
 * currency match what we stored before the payment started. Idempotent: safe to call
 * many times for the same reference.
 */
export async function settleDonation(reference) {
  const donation = await db.donation.findUnique({ where: { reference } });
  if (!donation) return { found: false };

  // Already final, nothing to do.
  if (donation.status === "SUCCESSFUL") return { found: true, donation };

  let tx;
  try {
    tx = await fetchTransaction(reference);
  } catch (err) {
    // Could not reach Paystack. Leave as-is; the webhook or a later check will settle it.
    return { found: true, donation, error: "Could not reach the payment provider." };
  }

  let status = donation.status;
  if (tx.status === "success") {
    const amountMatches = tx.amount === donation.amountKobo;
    const currencyMatches = tx.currency === "NGN";
    if (amountMatches && currencyMatches) {
      status = "SUCCESSFUL";
    } else {
      // Paid amount differs from what we expected. Do not count it as a clean success.
      status = "FAILED";
      console.error("Donation amount/currency mismatch", {
        reference,
        expected: donation.amountKobo,
        got: tx.amount,
        currency: tx.currency,
      });
    }
  } else if (tx.status === "failed") {
    status = "FAILED";
  } else if (tx.status === "abandoned") {
    status = "CANCELLED";
  } // "ongoing" / "pending" / "processing" stay PENDING

  if (status === donation.status) return { found: true, donation };

  const updated = await db.donation.update({
    where: { reference },
    data: {
      status,
      paidAt: status === "SUCCESSFUL" ? new Date(tx.paid_at || Date.now()) : null,
      gatewayResponse: String(tx.gateway_response || "").slice(0, 200) || null,
    },
  });

  if (status === "SUCCESSFUL" && updated.userId) {
    await db.notification.create({
      data: {
        userId: updated.userId,
        title: "Donation received",
        body: `Thank you. Your donation of ₦${(updated.amountKobo / 100).toLocaleString("en-NG")} was received. Reference: ${updated.reference}.`,
      },
    });
  }

  return { found: true, donation: updated };
}
