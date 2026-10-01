import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Badge, EmptyState } from "@/components/Bits";
import { DONATION_BADGE, formatDate, nairaFromKobo } from "@/lib/format";

export const metadata = { title: "My Donations" };

export default async function PatientDonationsPage() {
  const user = await getCurrentUser();
  const donations = await db.donation.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="panel">
      <div className="section-head row">
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>My Donations</h1>
        <Link href="/treasury" className="btn btn-success btn-sm">Donate Again</Link>
      </div>

      {donations.length === 0 ? (
        <EmptyState title="No donations yet">
          <Link href="/treasury">Support a patient today</Link>.
        </EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Amount</th><th>Purpose</th><th>Date</th><th>Reference</th><th>Status</th></tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id}>
                  <td>{nairaFromKobo(d.amountKobo)}</td>
                  <td>{d.purpose}</td>
                  <td>{formatDate(d.createdAt)}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.9em" }}>{d.reference}</td>
                  <td><Badge map={DONATION_BADGE} value={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
