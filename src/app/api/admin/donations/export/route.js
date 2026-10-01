import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard } from "@/lib/adminGuard";
import { audit } from "@/lib/security";

/** Escapes a value for CSV and neutralises spreadsheet formulas. A donor could type a
 *  name starting with = + - @ so that Excel runs it as a formula when the file opens. */
function cell(value) {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  // Read-only, so no origin check needed, but the admin session is still required.
  const g = await guard(undefined, { mutating: false });
  if (g.error) return g.error;

  const rows = await db.donation.findMany({ orderBy: { createdAt: "desc" }, take: 20000 });

  const header = ["Donation ID", "Reference", "Donor", "Anonymous", "Email", "Phone", "Amount (NGN)", "Purpose", "Status", "Paid at", "Created"];
  const lines = [header.map(cell).join(",")];
  for (const d of rows) {
    lines.push(
      [
        d.id,
        d.reference,
        d.isAnonymous ? "Anonymous" : d.donorName,
        d.isAnonymous ? "yes" : "no",
        d.donorEmail,
        d.donorPhone,
        (d.amountKobo / 100).toFixed(2),
        d.purpose,
        d.status,
        d.paidAt ? d.paidAt.toISOString() : "",
        d.createdAt.toISOString(),
      ]
        .map(cell)
        .join(",")
    );
  }

  await audit(g.admin.id, "DONATIONS_EXPORTED", "Donation", null, `${rows.length} rows`);

  return new NextResponse("\uFEFF" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="donations-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
