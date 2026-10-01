"use client";

import { useState } from "react";
import { PasswordField } from "./Fields";
import { submitJson } from "@/lib/client";

export default function AdminPasswordForm() {
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setSuccess(false);
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const res = await submitJson(
      "/api/admin/password",
      { currentPassword: fd.get("currentPassword"), newPassword: fd.get("newPassword"), confirmPassword: fd.get("confirmPassword") },
      "PUT"
    );
    setBusy(false);
    if (res.ok) {
      setSuccess(true);
      e.currentTarget.reset();
      return;
    }
    setErrors(res.errors);
    setMessage(res.message);
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {message && <div className="alert error" role="alert">{message}</div>}
      {success && <div className="alert success" role="status">Your password has been changed.</div>}
      <PasswordField label="Current password" name="currentPassword" autoComplete="current-password" required error={errors.currentPassword} />
      <PasswordField
        label="New password"
        name="newPassword"
        autoComplete="new-password"
        required
        error={errors.newPassword}
        hint="At least 12 characters, with an uppercase letter, a lowercase letter, a number and a symbol."
      />
      <PasswordField label="Confirm new password" name="confirmPassword" autoComplete="new-password" required error={errors.confirmPassword} />
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Updating…" : "Change Password"}</button>
    </form>
  );
}
