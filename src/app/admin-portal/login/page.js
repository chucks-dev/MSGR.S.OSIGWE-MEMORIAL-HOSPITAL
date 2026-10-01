import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/session";
import AdminLoginForm from "@/components/AdminLoginForm";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ADMIN_PATH =
  process.env.ADMIN_PATH || "secure-management-portal-x7k29";

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) {
    redirect(`/${ADMIN_PATH}`);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--navy-900)",
        display: "grid",
        placeItems: "center",
        padding: "1.5rem",
      }}
    >
      <div
        className="form-card"
        style={{ maxWidth: 420, width: "100%" }}
      >
        <h1 style={{ fontSize: "1.6rem" }}>Administrator Login</h1>

        <p style={{ color: "var(--ink-soft)" }}>
          This area is restricted to hospital staff.
        </p>

        <AdminLoginForm />
      </div>
    </div>
  );
}
