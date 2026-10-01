import Link from "next/link";
import { getSettings, toTelHref } from "@/lib/settings";

export const metadata = { title: "Forgot Password" };

export default async function ForgotPasswordPage() {
  const s = await getSettings();
  return (
    <section className="section tint">
      <div className="wrap auth-wrap">
        <div className="form-card">
          <h1 style={{ fontSize: "1.9rem" }}>Forgot your password?</h1>
          <p>
            Automatic password reset by email is not switched on yet. To get back into your account,
            please contact the hospital and we will help you reset it.
          </p>
          <ul className="contact-list" style={{ marginBottom: "1.25rem" }}>
            {s.phone && <li><span><strong>Phone</strong><a href={toTelHref(s.phone)}>{s.phone}</a></span></li>}
            {s.email && <li><span><strong>Email</strong><a href={`mailto:${s.email}`}>{s.email}</a></span></li>}
          </ul>
          <div className="btn-row">
            <Link href="/contact" className="btn btn-primary">Contact the hospital</Link>
            <Link href="/login" className="btn btn-outline">Back to login</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
