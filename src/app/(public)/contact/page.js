import { getSettings, toTelHref } from "@/lib/settings";
import { PageHero } from "@/components/Bits";
import ContactList from "@/components/ContactList";
import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const s = await getSettings();
  const emergencyHref = toTelHref(s.emergencyPhone);

  return (
    <>
      <PageHero title="Contact Us">We are here to help. Reach us any way that suits you.</PageHero>
      <section className="section">
        <div className="wrap split" style={{ alignItems: "start" }}>
          <div>
            <h2>Hospital details</h2>
            <ContactList s={s} />
            {emergencyHref && (
              <p className="alert error" style={{ marginTop: "1.25rem" }}>
                <strong>Emergency line:</strong> <a href={emergencyHref} style={{ color: "inherit" }}>{s.emergencyPhone}</a>
              </p>
            )}
            <div style={{ marginTop: "1.5rem" }}>
              {s.mapEmbedUrl ? (
                <iframe
                  className="map-frame"
                  title="Hospital location on Google Maps"
                  src={s.mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="empty">Map will appear here once a Google Maps embed link is added in Website Settings.</div>
              )}
            </div>
          </div>
          <div className="form-card">
            <h2>Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
