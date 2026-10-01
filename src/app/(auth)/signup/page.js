import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import SignupForm from "@/components/SignupForm";

export const metadata = { title: "Sign Up" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/portal");
  return (
    <section className="section tint">
      <div className="wrap auth-wrap">
        <div className="form-card">
          <h1 style={{ fontSize: "1.9rem" }}>Create your account</h1>
          <p style={{ color: "var(--ink-soft)" }}>Book appointments and keep track of your visits online.</p>
          <SignupForm />
        </div>
      </div>
    </section>
  );
}
