"use client";

import { useState } from "react";
import { EmptyState } from "./Bits";
import { sendAction } from "@/lib/client";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/format";

export default function MessagesAdmin({ messages }) {
  const router = useRouter();
  const [openId, setOpenId] = useState(null);

  async function markRead(id, isRead) {
    await sendAction(`/api/admin/messages/${id}`, "PATCH", { isRead });
    router.refresh();
  }
  async function archive(id) {
    await sendAction(`/api/admin/messages/${id}`, "PATCH", { isArchived: true });
    router.refresh();
  }

  if (messages.length === 0) {
    return <EmptyState title="No messages">Messages sent through the Contact page will appear here.</EmptyState>;
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.75rem" }}>
      {messages.map((m) => {
        const open = openId === m.id;
        return (
          <li key={m.id} className="panel" style={{ marginTop: 0 }}>
            <div
              style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", cursor: "pointer" }}
              onClick={() => { setOpenId(open ? null : m.id); if (!m.isRead) markRead(m.id, true); }}
            >
              <div>
                <strong style={{ color: "var(--navy)" }}>{!m.isRead && <span className="badge amber" style={{ marginRight: "0.5rem" }}>New</span>}{m.subject}</strong>
                <div className="meta">{m.name} &middot; {m.email}{m.phone ? ` · ${m.phone}` : ""}</div>
              </div>
              <span className="meta">{formatDateTime(m.createdAt)}</span>
            </div>
            {open && (
              <div style={{ marginTop: "0.75rem", borderTop: "1px solid var(--mist)", paddingTop: "0.75rem" }}>
                <p style={{ whiteSpace: "pre-line" }}>{m.message}</p>
                <div className="btn-row">
                  <a className="btn btn-outline btn-sm" href={`mailto:${m.email}`}>Reply by Email</a>
                  <button className="btn btn-ghost btn-sm" onClick={() => markRead(m.id, !m.isRead)}>
                    Mark as {m.isRead ? "unread" : "read"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => archive(m.id)}>Archive</button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
