import { db } from "@/lib/db";
import { EmptyState } from "@/components/Bits";
import { StatusSelect } from "@/components/AdminActions";
import { formatDate, formatTime } from "@/lib/format";

export const metadata = { title: "Appointments" };
const PAGE_SIZE = 25;
const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default async function AdminAppointmentsPage({ searchParams }) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status) ? sp.status : null;
  const q = (sp.q || "").trim();
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const where = {
    ...(status ? { status } : {}),
    ...(q ? { user: { fullName: { contains: q, mode: "insensitive" } } } : {}),
  };

  const [appointments, total] = await Promise.all([
    db.appointment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: true, service: true, doctor: true },
    }),
    db.appointment.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <h1 style={{ fontSize: "1.6rem" }}>Appointments</h1>

      <form method="get" className="filters">
        <div className="field">
          <label htmlFor="q">Patient name</label>
          <input id="q" name="q" className="input" defaultValue={q} placeholder="Search by patient…" />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" className="select" defaultValue={status || ""}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s[0] + s.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
        <button className="btn btn-outline" type="submit">Filter</button>
      </form>

      {appointments.length === 0 ? (
        <EmptyState title="No appointments found" />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Patient</th><th>Service</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.user.fullName}<br /><span className="meta">{a.user.phone}</span></td>
                    <td>{a.service.name}</td>
                    <td>{a.doctor ? a.doctor.name : "—"}</td>
                    <td>{formatDate(a.preferredDate)}</td>
                    <td>{formatTime(a.preferredTime)}</td>
                    <td style={{ maxWidth: 220 }}>{a.reason}</td>
                    <td>
                      <StatusSelect
                        url={`/api/admin/appointments/${a.id}`}
                        value={a.status}
                        options={STATUSES.map((s) => ({ value: s, label: s[0] + s.slice(1).toLowerCase() }))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <nav className="pager">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <a key={p} className="chip" aria-current={p === page} href={`?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), page: String(p) })}`}>{p}</a>
              ))}
            </nav>
          )}
        </>
      )}
    </>
  );
}
