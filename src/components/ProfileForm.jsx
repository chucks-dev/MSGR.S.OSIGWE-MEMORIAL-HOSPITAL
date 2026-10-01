"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "./Fields";
import { submitJson } from "@/lib/client";

export default function ProfileForm({ user }) {
  const router = useRouter();
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
    const f = new FormData(e.currentTarget);
    const res = await submitJson(
      "/api/profile",
      { fullName: f.get("fullName"), address: f.get("address"), phone: f.get("phone") },
      "PUT"
    );
    setBusy(false);
    if (res.ok) {
      setSuccess(true);
      router.refresh();
      return;
    }
    setErrors(res.errors);
    setMessage(res.message);
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {message && <div className="alert error" role="alert">{message}</div>}
      {success && <div className="alert success" role="status">Your profile has been updated.</div>}

      <TextField label="Full Name" name="fullName" defaultValue={user.fullName} required error={errors.fullName} />
      <TextField label="Email" name="email" defaultValue={user.email} disabled readOnly hint="Contact the hospital to change your email address." />
      <TextField label="Home Address" name="address" defaultValue={user.address} required error={errors.address} />
      <TextField label="Phone Number" name="phone" type="tel" defaultValue={user.phone} required error={errors.phone} />

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
