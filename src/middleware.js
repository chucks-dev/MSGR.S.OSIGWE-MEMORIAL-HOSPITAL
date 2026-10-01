import { NextResponse } from "next/server";

const ADMIN_PATH = process.env.ADMIN_PATH || "secure-management-portal-x7k29";

/**
 * Security headers on every response.
 *
 * The Content-Security-Policy allows only our own scripts and Paystack's checkout.
 * Note that Next.js needs 'unsafe-inline' for its own inline bootstrap scripts unless
 * you add nonce handling. That is documented in the README as a hardening step.
 */
function withHeaders(res) {
  const isProd = process.env.NODE_ENV === "production";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src https://www.google.com https://maps.google.com https://www.google.com/maps/",
    "form-action 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
  ].join("; ");

  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (isProd) {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  }
  return res;
}

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // The admin portal lives at /<ADMIN_PATH> internally under /admin-portal.
  // Anyone requesting /admin-portal directly gets a plain 404, so the internal
  // folder name is never a second way in.
  if (pathname === "/admin-portal" || pathname.startsWith("/admin-portal/")) {
    return withHeaders(new NextResponse(null, { status: 404 }));
  }

  if (pathname === `/${ADMIN_PATH}` || pathname.startsWith(`/${ADMIN_PATH}/`)) {
    const rest = pathname.slice(ADMIN_PATH.length + 1); // "" or "/something"
    const url = req.nextUrl.clone();
    url.pathname = `/admin-portal${rest}`;
    const res = NextResponse.rewrite(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.headers.set("Cache-Control", "no-store");
    return withHeaders(res);
  }

  // Patient portal: quick cookie-presence check. Real verification happens in the layout.
  if (pathname.startsWith("/portal") && !req.cookies.get("cch_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return withHeaders(NextResponse.redirect(url));
  }

  return withHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads/).*)"],
};
