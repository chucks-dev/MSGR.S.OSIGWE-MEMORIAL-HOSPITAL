"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, TextArea } from "./Fields";
import { submitForm } from "@/lib/client";

export default function DoctorFormModal({ doctor, onClose }) {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(doctor);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const res = await submitForm(isEdit ? `/api/admin/doctors/${doctor.id}` : "/api/admin/doctors", fd, isEdit ? "PUT" : "POST");
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
      <div className="dialog" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit staff profile" : "Add staff profile"} style={{ maxWidth: 520, borderTopColor: "var(--navy)" }}>
        <h2 style={{ color: "var(--navy)" }}>{isEdit ? "Edit Staff Profile" : "Add Staff Profile"}</h2>
        <form className="form" onSubmit={onSubmit} noValidate>
          {message && <div className="alert error" role="alert">{message}</div>}
          <TextField label="Full name" name="name" defaultValue={doctor?.name} required error={errors.name} />
          <TextField label="Position" name="position" defaultValue={doctor?.position} placeholder="e.g. Medical Officer" required error={errors.position} />
          <TextField label="Specialization" name="specialization" defaultValue={doctor?.specialization} placeholder="e.g. General Medicine" required error={errors.specialization} />
          <TextArea label="Short biography" name="bio" defaultValue={doctor?.bio} rows={4} required error={errors.bio} />
          <div className="field">
            <label htmlFor="photo">Photograph (JPG, PNG or WebP, max 3MB)</label>
            <input id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp" className="input" />
            {errors.photo && <span className="error-text" role="alert">{errors.photo}</span>}
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
