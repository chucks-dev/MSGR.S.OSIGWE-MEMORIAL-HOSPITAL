"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, TextArea } from "./Fields";
import { submitJson } from "@/lib/client";

export default function SettingsForm({ fields, values }) {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const groups = fields.reduce((acc, f) => {
    (acc[f.group] ||= []).push(f);
    return acc;
  }, {});

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setSuccess(false);
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const body = {};
    for (const f of fields) body[f.key] = fd.get(f.key) || "";
    const res = await submitJson("/api/admin/settings", body, "PUT");
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
      {success && <div className="alert success" role="status">Website settings updated.</div>}

      {Object.entries(groups).map(([group, items]) => (
        <div className="panel" key={group} style={{ marginTop: 0 }}>
          <h2 style={{ fontSize: "1.15rem" }}>{group}</h2>
          <div className="form">
            {items.map((f) =>
              f.long ? (
                <TextArea key={f.key} label={f.label} name={f.key} defaultValue={values[f.key]} rows={3} error={errors[f.key]} />
              ) : (
                <TextField key={f.key} label={f.label} name={f.key} defaultValue={values[f.key]} error={errors[f.key]} />
              )
            )}
          </div>
        </div>
      ))}

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Saving…" : "Save Website Settings"}
      </button>
    </form>
  );
}
