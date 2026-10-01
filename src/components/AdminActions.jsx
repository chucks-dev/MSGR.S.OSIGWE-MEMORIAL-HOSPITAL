"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendAction } from "@/lib/client";

/** A <select> that PATCHes immediately on change, e.g. appointment status. */
export function StatusSelect({ url, value, options, field = "status" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onChange(e) {
    const next = e.target.value;
    setBusy(true);
    setError("");
    const res = await sendAction(url, "PATCH", { [field]: next });
    setBusy(false);
    if (!res.ok) return setError(res.message || "Could not update.");
    router.refresh();
  }

  return (
    <div>
      <select className="select" value={value} onChange={onChange} disabled={busy} style={{ minHeight: 40 }}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}

/** A small on/off button, e.g. active/inactive, read/unread. */
export function ToggleButton({ url, field, value, onLabel, offLabel, className = "btn btn-outline btn-sm" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    const res = await sendAction(url, "PATCH", { [field]: !value });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <button type="button" className={className} onClick={onClick} disabled={busy}>
      {value ? onLabel : offLabel}
    </button>
  );
}

/** A delete button that asks for confirmation first. */
export function DeleteButton({ url, label = "Delete", confirmText = "Delete this item? This cannot be undone." }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function onClick() {
    if (!window.confirm(confirmText)) return;
    start(async () => {
      setError("");
      const res = await sendAction(url, "DELETE");
      if (!res.ok) return setError(res.message || "Could not delete.");
      router.refresh();
    });
  }

  return (
    <span>
      <button type="button" className="btn btn-danger btn-sm" onClick={onClick} disabled={pending}>
        {pending ? "Deleting…" : label}
      </button>
      {error && <div className="error-text">{error}</div>}
    </span>
  );
}
