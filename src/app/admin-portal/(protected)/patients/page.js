import { db } from "@/lib/db";
import { Badge, EmptyState } from "@/components/Bits";
import { ToggleButton } from "@/components/AdminActions";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Patients" };
const PAGE_SIZE = 25;

export default async function AdminPatientsPage({ searchParams }) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const where = q
    ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] }
    : {};

  const [patients, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, fullName: true, email: true, phone: true, isActive: true, createdAt: true, _count: { select: { appointments: true } } },
    }),
    db.user.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <h1 style={{ fontSize: "1.6rem" }}>Patients</h1>
      <form method="get" className="filters">
        <div className="field" style={{ flex: 2 }}>
          <label htmlFor="q">Search by name, email or phone</label>
          <input id="q" name="q" className="input" defaultValue={q} placeholder="Search patients…" />
        </div>
        <button className="btn btn-outline" type="submit">Search</button>
      </form>

      {patients.length === 0 ? (
        <EmptyState title="No patients found" />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Appointments</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>{p.fullName}</td>
                    <td>{p.email}</td>
                    <td>{p.phone}</td>
                    <td>{p._count.appointments}</td>
                    <td>{formatDate(p.createdAt)}</td>
                    <td><Badge map={{ true: { label: "Active", cls: "green" }, false: { label: "Disabled", cls: "red" } }} value={String(p.isActive)} /></td>
                    <td className="actions">
                      <ToggleButton
                        url={`/api/admin/patients/${p.id}`}
                        field="isActive"
                        value={p.isActive}
                        onLabel="Disable"
                        offLabel="Enable"
                        className={p.isActive ? "btn btn-outline btn-sm" : "btn btn-success btn-sm"}
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
                <a key={p} className="chip" aria-current={p === page} href={`?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`}>{p}</a>
              ))}
            </nav>
          )}
        </>
      )}
    </>
  );
}
