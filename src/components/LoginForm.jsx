"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, PasswordField, Checkbox } from "./Fields";
import { submitJson } from "@/lib/client";

/** Only allow redirects back to our own portal, never to another site. */
function safeNext(next) {
  return typeof next === "string" && next.startsWith("/portal") && !next.startsWith("//") ? next : "/portal";
}

export default function LoginForm({ next }) {
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
    const res = await submitJson("/api/auth/login", {
      email: f.get("email"),
      password: f.get("password"),
      remember: f.get("remember") === "on",
    });
    setBusy(false);
    if (res.ok) {
      router.push(safeNext(next));
      router.refresh();
      return;
    }
    setErrors(res.errors);
    setMessage(res.message);
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {message && <div className="alert error" role="alert">{message}</div>}

      <TextField label="Email" name="email" type="email" autoComplete="email" inputMode="email" required error={errors.email} />
      <PasswordField label="Password" name="password" autoComplete="current-password" required error={errors.password} />

      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <Checkbox label="Remember me" name="remember" />
        <Link href="/forgot-password">Forgot Password?</Link>
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
        {busy ? "Logging in…" : "Login"}
      </button>

      <p style={{ textAlign: "center", margin: 0 }}>
        New here? <Link href="/signup">Create Account</Link>
      </p>
    </form>
  );
}
