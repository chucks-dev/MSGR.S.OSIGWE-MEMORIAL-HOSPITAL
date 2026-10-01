import Link from "next/link";
import DonationResult from "@/components/DonationResult";

export const metadata = { title: "Donation Status" };

export default async function ThanksPage({ searchParams }) {
  const sp = await searchParams;
  // Paystack appends ?reference=... (and trxref=...) when it redirects back.
  const reference = sp.reference || sp.trxref || "";
  return (
    <section className="section">
      <div className="wrap auth-wrap" style={{ maxWidth: 620 }}>
        <DonationResult reference={reference} />
        <div className="btn-row" style={{ marginTop: "1.5rem" }}>
          <Link href="/" className="btn btn-outline">Back to home</Link>
          <Link href="/treasury" className="btn btn-primary">Give again</Link>
        </div>
      </div>
    </section>
  );
}
