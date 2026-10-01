"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/team", label: "Team" },
  { href: "/treasury", label: "Treasury" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="#fff">
        <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
      </svg>
    </span>
  );
}

export default function Header({ hospitalName, emergencyPhone, emergencyHref, loggedIn }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const dialogRef = useRef(null);

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [pathname]);

  // Emergency dialog: Escape to close, focus moves into it, and returns afterwards.
  useEffect(() => {
    if (!showEmergency) return;
    const previous = document.activeElement;
    dialogRef.current?.querySelector("a,button")?.focus();
    const onKey = (e) => e.key === "Escape" && setShowEmergency(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [showEmergency]);

  const isCurrent = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="site-header">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div className="wrap header-bar">
        <Link href="/" className="brand" aria-label={`${hospitalName} home`}>
          <BrandMark />
          <span>{hospitalName}</span>
        </Link>

        <button
          type="button"
          className="nav-emergency"
          onClick={() => setShowEmergency(true)}
          aria-haspopup="dialog"
        >
          <Icon name="phone" size={18} />
          Emergency
        </button>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? "close" : "menu"} size={22} />
          <span>{open ? "Close" : "Menu"}</span>
        </button>

        <nav id="site-nav" className={`nav${open ? " open" : ""}`} aria-label="Main">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="nav-link"
                  aria-current={isCurrent(l.href) ? "page" : undefined}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="nav-cta">
            {loggedIn ? (
              <Link href="/portal" className="btn btn-primary btn-sm">
                MyDashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline btn-sm">
                  Login
                </Link>
                <Link href="/signup" className="btn btn-primary btn-sm">
                  SignUp
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {showEmergency && (
        <div
          className="dialog-backdrop"
          onClick={(e) => e.target === e.currentTarget && setShowEmergency(false)}
        >
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergency-title"
            ref={dialogRef}
          >
            <h2 id="emergency-title">Emergency Assistance</h2>
            <p>Call our emergency line now.</p>
            {emergencyHref ? (
              <>
                <p>
                  <strong>{emergencyPhone}</strong>
                </p>
                <div className="btn-row">
                  <a href={emergencyHref} className="btn btn-danger btn-block">
                    <Icon name="phone" size={20} />
                    CALL NOW
                  </a>
                  <button type="button" className="btn btn-ghost btn-block" onClick={() => setShowEmergency(false)}>
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="alert info">
                  The emergency number has not been added yet. An administrator can add it under Website Settings.
                </p>
                <div className="btn-row">
                  <button type="button" className="btn btn-ghost btn-block" onClick={() => setShowEmergency(false)}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
