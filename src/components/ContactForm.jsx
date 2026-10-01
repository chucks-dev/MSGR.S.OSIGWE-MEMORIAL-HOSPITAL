"use client";

import { useState } from "react";
import { TextField, TextArea } from "./Fields";
import { submitJson } from "@/lib/client";

export default function ContactForm() {
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setErrors({});
    const f = new FormData(e.currentTarget);
    const res = await submitJson("/api/contact", {
      name: f.get("name"),
      email: f.get("email"),
      phone: f.get("phone"),
      subject: f.get("subject"),
      message: f.get("message"),
      website: f.get("website"), // honeypot
    });
    setBusy(false);
    if (res.ok) return setDone(true);
    setErrors(res.errors);
    setMessage(res.message);
  }

  if (done) {
    return (
      <div className="alert success" role="status">
        <strong>Message sent.</strong> Thank you for contacting us. We will reply as soon as we can.
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {message && <div className="alert error" role="alert">{message}</div>}
      <TextField label="Name" name="name" autoComplete="name" required error={errors.name} />
      <TextField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
      <TextField label="Phone (optional)" name="phone" type="tel" autoComplete="tel" error={errors.phone} />
      <TextField label="Subject" name="subject" required error={errors.subject} />
      <TextArea label="Message" name="message" rows={5} required error={errors.message} />
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label>Leave this empty<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
