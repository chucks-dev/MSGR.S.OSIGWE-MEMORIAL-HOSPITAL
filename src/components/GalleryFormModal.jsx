"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, SelectField } from "./Fields";
import { submitForm } from "@/lib/client";

const CATEGORIES = ["Hospital", "Medical Team", "Facilities", "Community Outreach", "Events"];

export default function GalleryFormModal({ onClose }) {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const res = await submitForm("/api/admin/gallery", fd, "POST");
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
      <div className="dialog" role="dialog" aria-modal="true" aria-label="Upload photo" style={{ maxWidth: 480, borderTopColor: "var(--navy)" }}>
        <h2 style={{ color: "var(--navy)" }}>Upload Photo</h2>
        <form className="form" onSubmit={onSubmit} noValidate>
          {message && <div className="alert error" role="alert">{message}</div>}
          <div className="field">
            <label htmlFor="image">Image (JPG, PNG or WebP, max 3MB)</label>
            <input id="image" name="image" type="file" accept="image/png,image/jpeg,image/webp" className="input" required />
            {errors.image && <span className="error-text" role="alert">{errors.image}</span>}
          </div>
          <TextField label="Caption" name="caption" required error={errors.caption} />
          <SelectField label="Category" name="category" defaultValue={CATEGORIES[0]} error={errors.category}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </SelectField>
          <div className="btn-row">
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Uploading…" : "Upload"}</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
