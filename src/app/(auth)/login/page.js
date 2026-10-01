import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Login" };

export default async function LoginPage({ searchParams }) {
  if (await getCurrentUser()) redirect("/portal");
  const { next } = await searchParams;
  return (
    <section className="section tint">
      <div className="wrap auth-wrap">
        <div className="form-card">
          <h1 style={{ fontSize: "1.9rem" }}>Welcome back</h1>
          <p style={{ color: "var(--ink-soft)" }}>Log in to manage your appointments and profile.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </section>
  );
}
