import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/Bits";
import { APPOINTMENT_BADGE, DONATION_BADGE, formatDate, nairaFromKobo } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalPatients,
    totalAppointments,
    pendingAppointments,
    donationTotals,
    monthDonationTotal,
    recentMessages,
    recentAppointments,
    purposeBreakdown,
  ] = await Promise.all([
    db.user.count(),
    db.appointment.count(),
    db.appointment.count({ where: { status: "PENDING" } }),
    db.donation.aggregate({ where: { status: "SUCCESSFUL" }, _sum: { amountKobo: true }, _count: true }),
    db.donation.aggregate({
      where: { status: "SUCCESSFUL", paidAt: { gte: startOfMonth } },
      _sum: { amountKobo: true },
    }),
    db.contactMessage.findMany({ where: { isArchived: false }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.appointment.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { service: true, user: true } }),
    db.donation.groupBy({ by: ["purpose"], where: { status: "SUCCESSFUL" }, _sum: { amountKobo: true } }),
  ]);

  const totalGiven = donationTotals._sum.amountKobo || 0;
  const maxPurpose = Math.max(1, ...purposeBreakdown.map((p) => p._sum.amountKobo || 0));

  return (
    <>
      <h1 style={{ fontSize: "1.7rem" }}>Dashboard</h1>

      <div className="grid cols-4" style={{ marginBottom: "1.5rem" }}>
        <div className="stat"><div className="num">{totalPatients}</div><div className="lbl">Registered Patients</div></div>
        <div className="stat"><div className="num">{totalAppointments}</div><div className="lbl">Total Appointments</div></div>
        <div className="stat"><div className="num">{pendingAppointments}</div><div className="lbl">Pending Appointments</div></div>
        <div className="stat"><div className="num">{donationTotals._count}</div><div className="lbl">Successful Donations</div></div>
        <div className="stat"><div className="num">{nairaFromKobo(totalGiven)}</div><div className="lbl">Total Donations</div></div>
        <div className="stat"><div className="num">{nairaFromKobo(monthDonationTotal._sum.amountKobo || 0)}</div><div className="lbl">This Month</div></div>
      </div>

      <div className="grid cols-2">
        <div className="panel">
          <h2>Donations by purpose</h2>
          {purposeBreakdown.length === 0 ? (
            <p style={{ color: "var(--ink-soft)" }}>No successful donations yet.</p>
          ) : (
            <div className="bars">
              {purposeBreakdown.map((p) => (
                <div className="bar-row" key={p.purpose}>
                  <span>{p.purpose.split(" ")[0]}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${((p._sum.amountKobo || 0) / maxPurpose) * 100}%` }} />
                  </div>
                  <span>{nairaFromKobo(p._sum.amountKobo || 0)}</span>
                </div>
              ))}
            </div>
          )}
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
