import { getCurrentAdmin } from "@/lib/session";
import AdminPasswordForm from "@/components/AdminPasswordForm";

export const metadata = { title: "Admin Account" };

export default async function AdminAccountPage() {
  const admin = await getCurrentAdmin();
  return (
    <>
      <h1 style={{ fontSize: "1.6rem" }}>Admin Account</h1>
      <div className="panel" style={{ maxWidth: 480, marginTop: 0 }}>
        <p><strong>Name:</strong> {admin.name}</p>
        <p><strong>Email:</strong> {admin.email}</p>
        <p style={{ marginBottom: 0 }}><strong>Role:</strong> {admin.role === "SUPER_ADMIN" ? "Super Administrator" : "Staff"}</p>
      </div>
      <div className="panel" style={{ maxWidth: 480 }}>
        <h2 style={{ fontSize: "1.2rem" }}>Change Password</h2>
        <AdminPasswordForm />
      </div>
    </>
  );
}
