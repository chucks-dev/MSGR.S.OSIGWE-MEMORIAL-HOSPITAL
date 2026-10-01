import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/session";
import PortalNav from "@/components/PortalNav";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

const ADMIN_PATH = process.env.ADMIN_PATH || "secure-management-portal-x7k29";

const LINKS = [
  { path: "", label: "Dashboard" },
  { path: "/patients", label: "Patients" },
  { path: "/appointments", label: "Appointments" },
  { path: "/doctors", label: "Doctors / Staff" },
  { path: "/services", label: "Services" },
  { path: "/treasury", label: "Treasury" },
  { path: "/news", label: "News" },
  { path: "/gallery", label: "Gallery" },
  { path: "/messages", label: "Messages" },
  { path: "/settings", label: "Website Settings" },
  { path: "/account", label: "Admin Account" },
];

export default async function AdminLayout({ children }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect(`/${ADMIN_PATH}/login`);
  }

  return (
    <div className="portal admin-shell">
      <aside className="admin-side">
        <div className="admin-brand">
          Admin Portal
          <small>{admin.name}</small>
        </div>

        <PortalNav
          links={LINKS}
          adminPath={`/${ADMIN_PATH}`}
        />
        <div className="logout-slot">
          <LogoutButton endpoint="/api/admin/logout" className="btn btn-outline btn-sm" />
        </div>
      </aside>

      <div>
        <div className="wrap portal-main">{children}</div>
      </div>
    </div>
  );
}
