"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PortalNav({ links, adminPath = "" }) {
  const pathname = usePathname();

  return (
    <nav className="portal-nav" aria-label="Dashboard">
      {links.map((l) => {
        const href = `${adminPath}${l.path ?? l.href}`;

        return (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
