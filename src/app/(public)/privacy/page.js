import { getSettings } from "@/lib/settings";
import { PageHero } from "@/components/Bits";

export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="Privacy Policy" />
      <section className="section">
        <div className="wrap article-body">
          <p className="alert info">
            This is a starting template, not legal advice. Have it reviewed against the Nigeria Data Protection Act
            (NDPA) 2023 before the site goes live.
          </p>
          <h2>What we collect</h2>
          <p>
            When you create an account we collect your name, email address, home address and phone number. When you book
            an appointment we collect the service, date, time and reason for your visit.
          </p>
          <h2>What we do not collect</h2>
          <p>
            This website does not store medical records. Please do not put detailed medical history in the appointment
            message box.
          </p>
          <h2>How we use it</h2>
          <p>
            We use your details to manage your account and appointments, and to reply to your messages. We do not sell
            your information.
          </p>
          <h2>Your choices</h2>
          <p>
            You can update your name, address and phone number from your profile. To correct your email address or to ask
            us to delete your account, contact {s.email || "the hospital"}.
          </p>
        </div>
      </section>
    </>
  );
}
