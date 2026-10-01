"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, PasswordField } from "./Fields";
import { submitJson } from "@/lib/client";

export default function AdminLoginForm() {
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
    const res = await submitJson("/api/admin/login", {
      email: f.get("email"),
      password: f.get("password"),
    });
    setBusy(false);
    if (res.ok) {
      router.push(res.data.redirect || "/");
      router.refresh();
      return;
    }
    setErrors(res.errors);
    setMessage(res.message);
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {message && <div className="alert error" role="alert">{message}</div>}
      <TextField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
      <PasswordField label="Password" name="password" autoComplete="current-password" required error={errors.password} />
      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
        {busy ? "Logging in…" : "Login"}
      </button>
    </form>
  );
}
