"use client";

import { useState } from "react";
import { TextField, SelectField, Checkbox } from "./Fields";
import { submitJson } from "@/lib/client";

const PRESETS = [1000, 5000, 10000];
const PURPOSES = [
  "General Hospital Support",
  "Patient Medical Treatment",
  "Medication",
  "Emergency Care",
  "Maternal & Child Care",
];

export default function DonationForm({ defaults }) {
  const [amount, setAmount] = useState(5000);
  const [custom, setCustom] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setErrors({});
    const f = new FormData(e.currentTarget);
    const res = await submitJson("/api/donations/initialize", {
      amountNaira: amount,
      purpose: f.get("purpose"),
      donorName: f.get("donorName"),
      donorEmail: f.get("donorEmail"),
      donorPhone: f.get("donorPhone"),
      isAnonymous: f.get("isAnonymous") === "on",
    });
    if (res.ok && res.data.authorizationUrl) {
      // Hand over to Paystack's secure page. We keep the button disabled until the page unloads.
      window.location.assign(res.data.authorizationUrl);
      return;
    }
    setBusy(false);
    setErrors(res.errors);
    setMessage(res.message);
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {message && <div className="alert error" role="alert">{message}</div>}

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="label" style={{ fontWeight: 600, color: "var(--navy)", marginBottom: "0.5rem" }}>
          Donation amount
        </legend>
        <div className="amounts">
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p}
              className="amount-opt"
              aria-pressed={!custom && amount === p}
              onClick={() => { setCustom(false); setAmount(p); }}
            >
              ₦{p.toLocaleString("en-NG")}
            </button>
          ))}
          <button
            type="button"
            className="amount-opt"
            aria-pressed={custom}
            onClick={() => { setCustom(true); setAmount(""); }}
          >
            Custom Amount
          </button>
        </div>
        {custom && (
          <div style={{ marginTop: "0.75rem" }}>
            <TextField
              label="Enter amount in naira"
              name="customAmount"
              type="number"
              inputMode="numeric"
              min="500"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              error={errors.amountNaira}
              hint="Minimum ₦500."
            />
          </div>
        )}
        {!custom && errors.amountNaira && <span className="error-text" role="alert">{errors.amountNaira}</span>}
      </fieldset>

      <SelectField label="Donation purpose" name="purpose" defaultValue={PURPOSES[0]} error={errors.purpose}>
        {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
      </SelectField>

      <TextField label="Full Name" name="donorName" autoComplete="name" defaultValue={defaults?.fullName || ""} required error={errors.donorName} />
      <TextField label="Email" name="donorEmail" type="email" autoComplete="email" defaultValue={defaults?.email || ""} required error={errors.donorEmail} hint="Your payment receipt is sent here." />
      <TextField label="Phone Number" name="donorPhone" type="tel" autoComplete="tel" defaultValue={defaults?.phone || ""} required error={errors.donorPhone} />

      <Checkbox label="Make my donation anonymous" name="isAnonymous" />

      <button type="submit" className="btn btn-success btn-block" disabled={busy} style={{ minHeight: 56, fontSize: "1.1rem" }}>
        {busy ? "Opening secure payment…" : "DONATE NOW"}
      </button>
      <p style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: "0.9rem", margin: 0 }}>
        Payments are processed securely by Paystack. We never see or store your card details.
      </p>
    </form>
  );
}
