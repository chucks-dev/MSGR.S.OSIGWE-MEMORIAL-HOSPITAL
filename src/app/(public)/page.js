import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings, toWhatsAppHref } from "@/lib/settings";
import { Icon, serviceIcon } from "@/components/Icons";
import { BrandMark } from "@/components/Header";
import { Photo } from "@/components/Bits";
import { formatDate } from "@/lib/format";
import ContactList from "@/components/ContactList";

export default async function HomePage() {
  const [s, services, doctors, articles, gallery] = await Promise.all([
    getSettings(),
    db.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
    db.doctor.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 4 }),
    db.article.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" }, take: 3 }),
    db.galleryImage.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const heroImage = gallery.find((g) => g.category === "Hospital")?.imageUrl || gallery[0]?.imageUrl || null;

  return (
    <>
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="hero-brand">
              <BrandMark />
              <span>{s.hospitalName}</span>
            </div>
            <h1 id="hero-title">{s.heroHeadline}</h1>
            <p>{s.heroText}</p>
            <div className="btn-row" style={{ marginTop: "1.5rem" }}>
              <Link href="/appointments" className="btn btn-light">
                Book an Appointment
              </Link>
              <Link href="/treasury" className="btn btn-outline">
                Support a Patient
              </Link>
            </div>
          </div>
          <div className="hero-media">
            {heroImage && <img src={heroImage} alt={`${s.hospitalName} building`} fetchPriority="high" />}
          </div>
        </div>
      </section>

      {/* Assurance strip */}
      <div className="assure">
        <div className="wrap">
          <ul>
            <li><Icon name="ambulance" /> 24/7 Emergency Care</li>
            <li><Icon name="team" /> Experienced Medical Team</li>
            <li><Icon name="heart" /> Quality Patient Care</li>
          </ul>
        </div>
      </div>

      {/* About preview */}
      <section className="section" aria-labelledby="about-title">
        <div className="wrap split">
          <div>
            <h2 id="about-title">About {s.hospitalName}</h2>
            <p>{s.aboutIntro}</p>
            <Link href="/about" className="btn btn-outline">Learn More</Link>
          </div>
          <div>
            <Photo src={gallery.find((g) => g.category === "Facilities")?.imageUrl} alt="Hospital facilities" className="round-img" icon="cross" ratio="4 / 3" />
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="section tint" aria-labelledby="services-title">
        <div className="wrap">
          <div className="section-head row">
            <div>
              <h2 id="services-title">Featured Services</h2>
              <p>Care for every member of the family.</p>
            </div>
            <Link href="/services" className="btn btn-outline">View All Services</Link>
          </div>
          <div className="grid cols-3">
            {services.map((sv) => (
              <article className="card" key={sv.id}>
                <div className="card-body">
                  <div className="icon-tile"><Icon name={serviceIcon(sv.name)} /></div>
                  <h3>{sv.name}</h3>
                  <p>{sv.summary}</p>
                  <div className="card-actions">
                    <Link href={`/services/${sv.slug}`} className="btn btn-ghost btn-sm">Learn More</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section" aria-labelledby="team-title">
        <div className="wrap">
          <div className="section-head row">
            <div>
              <h2 id="team-title">Our Medical Team</h2>
              <p>The people who will look after you.</p>
            </div>
            <Link href="/team" className="btn btn-outline">Meet the Team</Link>
          </div>
          {doctors.length === 0 ? (
            <div className="empty">Team profiles will appear here once an administrator adds them.</div>
          ) : (
            <div className="grid cols-4">
              {doctors.map((d) => (
                <article className="card person" key={d.id}>
                  <Photo src={d.photoUrl} alt={d.name} className="avatar" icon="user" ratio="4 / 4.2" />
                  <div className="card-body">
                    <h3>{d.name}</h3>
                    <span className="role">{d.position}</span>
                    <span className="spec">{d.specialization}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Appointment CTA */}
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="cta-title">
        <div className="wrap">
          <div className="cta-band">
            <div>
              <h2 id="cta-title">Need Medical Attention?</h2>
              <p>Schedule an appointment with our healthcare team.</p>
            </div>
            <Link href="/appointments" className="btn btn-primary">Book an Appointment</Link>
          </div>
        </div>
      </section>

      {/* Treasury preview */}
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="give-title">
        <div className="wrap">
          <div className="give-band">
            <div>
              <h2 id="give-title">Give Hope. Support a Life.</h2>
              <p>Your contribution can help provide medical care to someone who needs it.</p>
            </div>
            <Link href="/treasury" className="btn btn-light">Donate Now</Link>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="section tint" aria-labelledby="news-title">
        <div className="wrap">
          <div className="section-head row">
            <div>
              <h2 id="news-title">Latest News</h2>
              <p>Health tips and updates from the hospital.</p>
            </div>
            <Link href="/news" className="btn btn-outline">All News</Link>
          </div>
          {articles.length === 0 ? (
            <div className="empty">No news yet. Check back soon.</div>
          ) : (
            <div className="grid cols-3">
              {articles.map((a) => (
                <article className="card" key={a.id}>
                  <Photo src={a.imageUrl} alt={a.title} className="card-img" icon="cross" />
                  <div className="card-body">
                    <span className="badge" style={{ alignSelf: "flex-start" }}>{a.category}</span>
                    <h3><Link href={`/news/${a.slug}`} style={{ textDecoration: "none" }}>{a.title}</Link></h3>
                    <p>{a.excerpt}</p>
                    <div className="meta">{formatDate(a.publishedAt)}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery preview */}
      {gallery.length > 0 && (
        <section className="section" aria-labelledby="gal-title">
          <div className="wrap">
            <div className="section-head row">
              <div>
                <h2 id="gal-title">Around the Hospital</h2>
              </div>
              <Link href="/gallery" className="btn btn-outline">View Gallery</Link>
            </div>
            <div className="gallery-grid">
              {gallery.slice(0, 4).map((g) => (
                <div className="gallery-item" key={g.id} style={{ cursor: "default" }}>
                  <img src={g.imageUrl} alt={g.caption} loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact preview */}
      <section className="section soft" aria-labelledby="contact-title">
        <div className="wrap split">
          <div>
            <h2 id="contact-title">Visit or Contact Us</h2>
            <ContactList s={s} />
          </div>
          <div className="btn-row">
            <Link href="/contact" className="btn btn-primary">Contact the Hospital</Link>
            {toWhatsAppHref(s.whatsapp) && (
              <a href={toWhatsAppHref(s.whatsapp)} className="btn btn-success" rel="noopener noreferrer" target="_blank">
                WhatsApp Us
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
