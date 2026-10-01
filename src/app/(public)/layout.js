import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings, toTelHref } from "@/lib/settings";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }) {
  const [s, user] = await Promise.all([getSettings(), getCurrentUser()]);
  return (
    <>
      <Header
        hospitalName={s.hospitalName}
        emergencyPhone={s.emergencyPhone}
        emergencyHref={toTelHref(s.emergencyPhone)}
        loggedIn={Boolean(user)}
      />
      <main id="main">{children}</main>
      <Footer s={s} />
    </>
  );
}
