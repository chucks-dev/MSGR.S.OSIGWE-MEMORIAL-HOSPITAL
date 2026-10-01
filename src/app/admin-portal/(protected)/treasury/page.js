import { db } from "@/lib/db";
import { Badge, EmptyState } from "@/components/Bits";
import { DONATION_BADGE, formatDate, nairaFromKobo } from "@/lib/format";

export const metadata = { title: "Treasury" };
const PAGE_SIZE = 30;
const STATUSES = ["PENDING", "SUCCESSFUL", "FAILED", "CANCELLED"];

export default async function AdminTreasuryPage({ searchParams }) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status) ? sp.status : null;
  const q = (sp.q || "").trim();
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

  const where = {
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ donorName: { contains: q, mode: "insensitive" } }, { donorEmail: { contains: q, mode: "insensitive" } }, { reference: { contains: q, mode: "insensitive" } }] } : {}),
  };

  const [donations, total, allTime, today, month, successfulCount, pendingCount] = await Promise.all([
    db.donation.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.donation.count({ where }),
    db.donation.aggregate({ where: { status: "SUCCESSFUL" }, _sum: { amountKobo: true } }),
    db.donation.aggregate({ where: { status: "SUCCESSFUL", paidAt: { gte: startOfDay } }, _sum: { amountKobo: true } }),
    db.donation.aggregate({ where: { status: "SUCCESSFUL", paidAt: { gte: startOfMonth } }, _sum: { amountKobo: true } }),
    db.donation.count({ where: { status: "SUCCESSFUL" } }),
    db.donation.count({ where: { status: "PENDING" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <div className="section-head row">
        <h1 style={{ fontSize: "1.6rem", margin: 0 }}>Treasury</h1>
        <a className="btn btn-outline btn-sm" href="/api/admin/donations/export">Export CSV</a>
      </div>

      <div className="grid cols-4" style={{ marginBottom: "1.5rem" }}>
        <div className="stat"><div className="num">{nairaFromKobo(allTime._sum.amountKobo || 0)}</div><div className="lbl">Total donations</div></div>
        <div className="stat"><div className="num">{nairaFromKobo(today._sum.amountKobo || 0)}</div><div className="lbl">Today</div></div>
        <div className="stat"><div className="num">{nairaFromKobo(month._sum.amountKobo || 0)}</div><div className="lbl">This month</div></div>
        <div className="stat"><div className="num">{successfulCount}</div><div className="lbl">Successful ({pendingCount} pending)</div></div>
      </div>

      <form method="get" className="filters">
        <div className="field">
          <label htmlFor="q">Donor, email or reference</label>
          <input id="q" name="q" className="input" defaultValue={q} placeholder="Search…" />
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

      {donations.length === 0 ? (
        <EmptyState title="No donations found" />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Donor</th><th>Amount</th><th>Purpose</th><th>Reference</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id}>
                    <td>{d.isAnonymous ? "Anonymous" : d.donorName}<br /><span className="meta">{d.donorEmail}</span></td>
                    <td>{nairaFromKobo(d.amountKobo)}</td>
                    <td>{d.purpose}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.9em" }}>{d.reference}</td>
                    <td><Badge map={DONATION_BADGE} value={d.status} /></td>
                    <td>{formatDate(d.createdAt)}</td>
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
