import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Badge } from "@/components/Bits";
import { APPOINTMENT_BADGE, formatDate, formatTime, nairaFromKobo } from "@/lib/format";

export const metadata = { title: "My Dashboard" };

export default async function PortalOverview() {
  const user = await getCurrentUser();

  const [upcoming, apptCount, donationTotal, recentAppts, recentNotifs] = await Promise.all([
    db.appointment.findFirst({
      where: { userId: user.id, status: { in: ["PENDING", "CONFIRMED"] }, preferredDate: { gte: new Date(new Date().toDateString()) } },
      orderBy: { preferredDate: "asc" },
      include: { service: true, doctor: true },
    }),
    db.appointment.count({ where: { userId: user.id } }),
    db.donation.aggregate({ where: { userId: user.id, status: "SUCCESSFUL" }, _sum: { amountKobo: true } }),
    db.appointment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3, include: { service: true } }),
    db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  return (
    <>
      <h1 style={{ fontSize: "1.8rem" }}>Welcome back, {user.fullName.split(" ")[0]}</h1>
      <p style={{ color: "var(--ink-soft)" }}>Here is a quick look at your account.</p>

      <div className="grid cols-4" style={{ marginBottom: "1.5rem" }}>
        <div className="stat">
          <div className="lbl">Upcoming appointment</div>
          <div className="num" style={{ fontSize: "1.15rem" }}>
            {upcoming ? formatDate(upcoming.preferredDate, { day: "numeric", month: "short" }) : "None"}
          </div>
        </div>
        <div className="stat">
          <div className="num">{apptCount}</div>
          <div className="lbl">Total appointments</div>
        </div>
        <div className="stat">
          <div className="num">{nairaFromKobo(donationTotal._sum.amountKobo || 0)}</div>
          <div className="lbl">Total donations</div>
        </div>
        <div className="stat">
          <div className="num">{recentNotifs.filter((n) => !n.isRead).length}</div>
          <div className="lbl">Unread notifications</div>
        </div>
      </div>

      {upcoming && (
        <div className="panel">
          <h2>Your next appointment</h2>
          <p style={{ margin: 0 }}>
            <strong>{upcoming.service.name}</strong>
            {upcoming.doctor ? ` with ${upcoming.doctor.name}` : ""} on{" "}
            {formatDate(upcoming.preferredDate)} at {formatTime(upcoming.preferredTime)}.{" "}
            <Badge map={APPOINTMENT_BADGE} value={upcoming.status} />
          </p>
        </div>
      )}

      <div className="panel">
        <div className="section-head row" style={{ marginBottom: "0.75rem" }}>
          <h2 style={{ margin: 0 }}>Recent activity</h2>
          <Link href="/portal/appointments">View all appointments</Link>
        </div>
        {recentAppts.length === 0 ? (
          <p style={{ color: "var(--ink-soft)" }}>
            No appointments yet. <Link href="/appointments">Book your first appointment</Link>.
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.6rem" }}>
            {recentAppts.map((a) => (
              <li key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <span>{a.service.name} &middot; {formatDate(a.preferredDate)}</span>
                <Badge map={APPOINTMENT_BADGE} value={a.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
