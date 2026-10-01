import { PageHero } from "@/components/Bits";

export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms of Use" />
      <section className="section">
        <div className="wrap article-body">
          <p className="alert info">This is a starting template, not legal advice. Have it reviewed before going live.</p>
          <h2>Using this website</h2>
          <p>
            This website provides general information about the hospital and lets you request appointments and make
            donations. It does not replace professional medical advice.
          </p>
          <h2>Emergencies</h2>
          <p>
            Do not use this website in a medical emergency. Use the red Emergency button to call the emergency line, or go
            to the nearest emergency service.
          </p>
          <h2>Appointments</h2>
          <p>
            An appointment request is not confirmed until the hospital confirms it. You will see the status in your
            dashboard.
          </p>
          <h2>Donations</h2>
          <p>
            Donations are voluntary and are processed by a third-party payment provider. A donation is only recorded as
            successful once the provider confirms the payment. Donations are used for the purpose you select where
            possible, and otherwise for general hospital support.
          </p>
          <h2>Accounts</h2>
          <p>Keep your password private. Accounts may be disabled if they are used to abuse the service.</p>
        </div>
      </section>
    </>
  );
}
