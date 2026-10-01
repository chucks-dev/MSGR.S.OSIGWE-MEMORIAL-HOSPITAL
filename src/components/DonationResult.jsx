"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LIMIT = 5; // attempts to wait for a slow confirmation

export default function DonationResult({ reference }) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    if (!reference) return setState({ loading: false, missing: true });
    let cancelled = false;
    let tries = 0;

    async function check() {
      tries += 1;
      try {
        const res = await fetch(`/api/donations/verify?reference=${encodeURIComponent(reference)}`, { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok) return setState({ loading: false, error: data?.error || "We could not check this donation." });
        // Still pending: the bank can take a few seconds. Try again a few times.
        if (data.status === "PENDING" && tries < LIMIT) return setTimeout(check, 3000);
        setState({ loading: false, data });
      } catch {
        if (!cancelled) setState({ loading: false, error: "We could not reach the server. Your payment may still have gone through." });
      }
    }
    check();
    return () => { cancelled = true; };
  }, [reference]);

  if (state.loading) {
    return <div className="alert info" role="status">Confirming your payment with Paystack…</div>;
  }
  if (state.missing) {
    return <div className="alert error" role="alert">No donation reference was found in this link.</div>;
  }
  if (state.error) {
    return (
      <div className="alert error" role="alert">
        {state.error} Reference: <strong>{reference}</strong>. If you were charged, please contact the hospital with this reference.
      </div>
    );
  }

  const d = state.data;
  const amount = `₦${Number(d.amountNaira).toLocaleString("en-NG")}`;

  if (d.status === "SUCCESSFUL") {
    return (
      <div className="alert success" role="status">
        <h2 style={{ fontSize: "1.5rem", color: "#14663f" }}>Thank you for your generosity.</h2>
        <p>Your donation has been received successfully.</p>
        <p style={{ margin: 0 }}>
          <strong>{amount}</strong> for {d.purpose}<br />
          Reference: <strong>{d.reference}</strong>
        </p>
      </div>
    );
  }
  if (d.status === "PENDING") {
    return (
      <div className="alert info" role="status">
        <strong>Your payment is still being confirmed.</strong> This can take a few minutes. Reference:{" "}
        <strong>{d.reference}</strong>. You do not need to pay again; check back shortly.
      </div>
    );
  }
  return (
    <div className="alert error" role="alert">
      <strong>The payment was not completed.</strong> No donation has been recorded ({d.status.toLowerCase()}). Reference:{" "}
      {d.reference}. You can <Link href="/treasury">try again</Link>.
    </div>
  );
}
