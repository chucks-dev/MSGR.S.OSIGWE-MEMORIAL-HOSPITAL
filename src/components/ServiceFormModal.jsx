"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, TextArea } from "./Fields";
import { submitForm } from "@/lib/client";

export default function ServiceFormModal({ service, onClose }) {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(service);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const res = await submitForm(isEdit ? `/api/admin/services/${service.id}` : "/api/admin/services", fd, isEdit ? "PUT" : "POST");
    setBusy(false);
    if (res.ok) {
      router.refresh();
      onClose();
      return;
    }
    setErrors(res.errors);
    setMessage(res.message);
  }

  return (
    <div className="dialog-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit service" : "Add service"} style={{ maxWidth: 560, borderTopColor: "var(--navy)" }}>
        <h2 style={{ color: "var(--navy)" }}>{isEdit ? "Edit Service" : "Add Service"}</h2>
        <form className="form" onSubmit={onSubmit} noValidate>
          {message && <div className="alert error" role="alert">{message}</div>}
          <TextField label="Service name" name="name" defaultValue={service?.name} required error={errors.name} />
          <TextField label="Short summary" name="summary" defaultValue={service?.summary} maxLength={200} required error={errors.summary} hint="Shown on cards. One short sentence." />
          <TextArea label="Full description" name="description" defaultValue={service?.description} rows={5} required error={errors.description} />
          <div className="field">
            <label htmlFor="image">Image (JPG, PNG or WebP, max 3MB)</label>
            <input id="image" name="image" type="file" accept="image/png,image/jpeg,image/webp" className="input" />
            {errors.image && <span className="error-text" role="alert">{errors.image}</span>}
          </div>
          <div className="btn-row">
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
