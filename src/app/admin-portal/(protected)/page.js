import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/Bits";
import { APPOINTMENT_BADGE, formatDate } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const [
    totalPatients,
    totalAppointments,
    pendingAppointments,
    recentMessages,
    recentAppointments,
  ] = await Promise.all([
    db.user.count(),
    db.appointment.count(),
    db.appointment.count({ where: { status: "PENDING" } }),
    db.contactMessage.findMany({ where: { isArchived: false }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.appointment.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { service: true, user: true } }),
  ]);

  return (
    <>
      <h1 style={{ fontSize: "1.7rem" }}>Dashboard</h1>

      <div className="grid cols-3" style={{ marginBottom: "1.5rem" }}>
        <div className="stat"><div className="num">{totalPatients}</div><div className="lbl">Registered Patients</div></div>
        <div className="stat"><div className="num">{totalAppointments}</div><div className="lbl">Total Appointments</div></div>
        <div className="stat"><div className="num">{pendingAppointments}</div><div className="lbl">Pending Appointments</div></div>
      </div>

      <div className="panel">
        <div className="section-head row" style={{ marginBottom: "0.5rem" }}>
          <h2 style={{ margin: 0 }}>Recent messages</h2>
          <Link href={`/${process.env.ADMIN_PATH || "secure-management-portal-x7k29"}/messages`}>View all</Link>
        </div>
        {recentMessages.length === 0 ? (
          <p style={{ color: "var(--ink-soft)" }}>No messages yet.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.6rem" }}>
            {recentMessages.map((m) => (
              <li key={m.id} style={{ borderBottom: "1px solid var(--mist)", paddingBottom: "0.5rem" }}>
                <strong>{m.name}</strong> — {m.subject}
                <div className="meta">{formatDate(m.createdAt)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel">
        <div className="section-head row" style={{ marginBottom: "0.5rem" }}>
          <h2 style={{ margin: 0 }}>Recent appointment requests</h2>
          <Link href={`/${process.env.ADMIN_PATH || "secure-management-portal-x7k29"}/appointments`}>Manage appointments</Link>
        </div>
        {recentAppointments.length === 0 ? (
          <p style={{ color: "var(--ink-soft)" }}>No appointments yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Patient</th><th>Service</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {recentAppointments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.user.fullName}</td>
                    <td>{a.service.name}</td>
                    <td>{formatDate(a.preferredDate)}</td>
                    <td><Badge map={APPOINTMENT_BADGE} value={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
