import Link from "next/link";
import { Icon } from "./Icons";
import { BrandMark } from "./Header";
import { toTelHref } from "@/lib/settings";

export default function Footer({ s }) {
  const year = new Date().getFullYear();
  const emergencyHref = toTelHref(s.emergencyPhone);
  const socials = [
    { key: "facebook", label: "Facebook", icon: "facebook" },
    { key: "instagram", label: "Instagram", icon: "instagram" },
    { key: "x", label: "X (Twitter)", icon: "x" },
  ].filter((x) => s[x.key]);

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ color: "#fff", marginBottom: "0.75rem" }}>
              <BrandMark />
              <span>{s.hospitalName}</span>
            </div>
            <p>{s.tagline}. Reliable, affordable and compassionate care for our community.</p>
            {socials.length > 0 && (
              <ul style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
                {socials.map((x) => (
                  <li key={x.key}>
                    <a href={s[x.key]} rel="noopener noreferrer" target="_blank" aria-label={x.label}>
                      <Icon name={x.icon} size={24} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3>Explore</h3>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/team">Our Team</Link></li>
              <li><Link href="/news">News</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/treasury">Treasury</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3>Services</h3>
            <ul>
              <li><Link href="/services">All services</Link></li>
              <li><Link href="/appointments">Book an appointment</Link></li>
              <li><Link href="/login">Patient login</Link></li>
              <li><Link href="/signup">Create account</Link></li>
            </ul>
          </div>

          <div>
            <h3>Contact</h3>
            <ul>
              {s.address && <li>{s.address}</li>}
              {s.phone && <li><a href={toTelHref(s.phone)}>{s.phone}</a></li>}
              {s.email && <li><a href={`mailto:${s.email}`}>{s.email}</a></li>}
              {!s.address && !s.phone && !s.email && <li>Contact details coming soon.</li>}
            </ul>
            {emergencyHref && (
              <a href={emergencyHref} className="footer-emergency">
                Emergency: {s.emergencyPhone}
              </a>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            &copy; {year} {s.hospitalName}. All rights reserved.
          </span>
          <span style={{ display: "flex", gap: "1.25rem" }}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
