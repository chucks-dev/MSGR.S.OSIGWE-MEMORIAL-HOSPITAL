import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import PortalNav from "@/components/PortalNav";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/profile", label: "My Profile" },
  { href: "/portal/appointments", label: "Appointments" },
  { href: "/portal/donations", label: "Donations" },
  { href: "/portal/notifications", label: "Notifications" },
];

export default async function PortalLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/portal");

  return (
    <div className="portal">
      <div className="portal-top">
        <div className="wrap bar">
          <strong style={{ color: "var(--navy)" }}>Hi, {user.fullName.split(" ")[0]}</strong>
        </div>
        <div className="wrap">
          <div className="portal-nav-row">
            <PortalNav links={LINKS} />
            <LogoutButton endpoint="/api/auth/logout" />
          </div>
        </div>
      </div>
      <div className="wrap portal-main">{children}</div>
    </div>
  );
}
