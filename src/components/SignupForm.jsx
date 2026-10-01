"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, PasswordField } from "./Fields";
import { submitJson } from "@/lib/client";

export default function SignupForm() {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setErrors({});
    const f = new FormData(e.currentTarget);
    const res = await submitJson("/api/auth/signup", {
      fullName: f.get("fullName"),
      email: f.get("email"),
      address: f.get("address"),
      phone: f.get("phone"),
      password: f.get("password"),
      confirmPassword: f.get("confirmPassword"),
    });
    setBusy(false);
    if (res.ok) {
      router.push(res.data.redirect || "/portal");
      router.refresh();
      return;
    }
    setErrors(res.errors);
    setMessage(res.message);
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {message && <div className="alert error" role="alert">{message}</div>}

      <TextField label="Full Name" name="fullName" autoComplete="name" required error={errors.fullName} />
      <TextField label="Email" name="email" type="email" autoComplete="email" inputMode="email" required error={errors.email} />
      <TextField label="Home Address" name="address" autoComplete="street-address" required error={errors.address} />
      <TextField
        label="Phone Number"
        name="phone"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="08012345678"
        required
        error={errors.phone}
      />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="new-password"
        required
        error={errors.password}
        hint="At least 8 characters, with an uppercase letter, a lowercase letter and a number."
      />
      <PasswordField
        label="Confirm Password"
        name="confirmPassword"
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
      />

      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
        {busy ? "Creating account…" : "Create Account"}
      </button>

      <p style={{ textAlign: "center", margin: 0 }}>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </form>
  );
}
