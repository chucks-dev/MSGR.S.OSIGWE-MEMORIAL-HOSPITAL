"use client";

import Link from "next/link";
import { useState } from "react";
import { TextField, TextArea, SelectField } from "./Fields";
import { submitJson } from "@/lib/client";

// Half-hour slots across a normal working day. Admins confirm the real time.
const TIMES = [];
for (let h = 8; h <= 16; h++) for (const m of ["00", "30"]) TIMES.push(`${String(h).padStart(2, "0")}:${m}`);

function label(t) {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export default function AppointmentForm({ services, doctors, defaultServiceId }) {
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setErrors({});
    const f = new FormData(e.currentTarget);
    const res = await submitJson("/api/appointments", {
      serviceId: f.get("serviceId"),
      doctorId: f.get("doctorId") || null,
      preferredDate: f.get("preferredDate"),
      preferredTime: f.get("preferredTime"),
      reason: f.get("reason"),
      message: f.get("message"),
    });
    setBusy(false);
    if (res.ok) return setDone(true);
    setErrors(res.errors);
    setMessage(res.message);
  }

  if (done) {
    return (
      <div className="alert success" role="status">
        <h2 style={{ fontSize: "1.4rem", color: "#14663f" }}>Appointment request received</h2>
        <p>
          Your request is <strong>pending</strong>. The hospital will review it and confirm. You can follow its status
          in your dashboard.
        </p>
        <div className="btn-row">
          <Link href="/portal/appointments" className="btn btn-primary">View my appointments</Link>
          <button type="button" className="btn btn-outline" onClick={() => setDone(false)}>Book another</button>
        </div>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {message && <div className="alert error" role="alert">{message}</div>}

      <SelectField label="Department / Service" name="serviceId" defaultValue={defaultServiceId || ""} required error={errors.serviceId}>
        <option value="" disabled>Choose a service</option>
        {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </SelectField>

      <SelectField label="Doctor (optional)" name="doctorId" defaultValue="" error={errors.doctorId} hint="Leave as “No preference” and we will assign someone.">
        <option value="">No preference</option>
        {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
      </SelectField>

      <div className="grid cols-2">
        <TextField label="Preferred date" name="preferredDate" type="date" min={today} required error={errors.preferredDate} />
        <SelectField label="Preferred time" name="preferredTime" defaultValue="" required error={errors.preferredTime}>
          <option value="" disabled>Choose a time</option>
          {TIMES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
        </SelectField>
      </div>

      <TextField label="Reason for visit" name="reason" maxLength={300} required error={errors.reason} />
      <TextArea
        label="Additional message (optional)"
        name="message"
        maxLength={1000}
        error={errors.message}
        hint="Please do not include detailed medical history here."
      />

      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
        {busy ? "Sending request…" : "Request Appointment"}
      </button>
    </form>
  );
}
