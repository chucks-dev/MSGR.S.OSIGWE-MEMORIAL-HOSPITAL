import { getCurrentUser } from "@/lib/session";
import DonationForm from "@/components/DonationForm";

export const metadata = { title: "Treasury" };

export default async function TreasuryPage() {
  const user = await getCurrentUser();
  return (
    <>
      <div className="page-hero" style={{ background: "var(--navy)", color: "#fff", borderBottom: 0 }}>
        <div className="wrap">
          <h1 style={{ color: "#fff" }}>Give Hope. Support a Life.</h1>
          <p style={{ color: "#d6e2f1" }}>Your contribution can help provide medical care to someone who needs it.</p>
        </div>
      </div>
      <section className="section">
        <div className="wrap auth-wrap" style={{ maxWidth: 620 }}>
          <div className="form-card">
            <DonationForm defaults={user ? { fullName: user.fullName, email: user.email, phone: user.phone } : null} />
          </div>
          {!user && (
            <p style={{ textAlign: "center", color: "var(--ink-soft)", marginTop: "1rem" }}>
              You do not need an account to donate.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
