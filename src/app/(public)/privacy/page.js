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
            an appointment we collect the service, date, time and reason for your visit. When you donate we collect your
            name, email and phone number, and the amount and purpose of your gift.
          </p>
          <h2>What we do not collect</h2>
          <p>
            This website does not store medical records. Please do not put detailed medical history in the appointment
            message box. Card details are entered on the payment provider&apos;s secure page and are never stored by us.
          </p>
          <h2>How we use it</h2>
          <p>
            We use your details to manage your account and appointments, to process and record donations, and to reply to
            your messages. We do not sell your information.
          </p>
          <h2>Anonymous donations</h2>
          <p>
            If you tick &quot;Make my donation anonymous&quot;, your name is hidden from public displays. Hospital
            administrators can still see donation records for accounting purposes.
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
