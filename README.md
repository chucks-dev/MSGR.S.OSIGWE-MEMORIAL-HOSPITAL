# Community Care Hospital — website & patient portal

A full-stack hospital website built with Next.js (App Router), PostgreSQL (via Prisma)
and Paystack for donations.

## 1. Requirements

- Node.js 20 or later
- A PostgreSQL database (local, or a hosted one like Supabase/Neon/Railway)
- A Paystack account (test keys are fine to start)

## 2. Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` — your PostgreSQL connection string.
- `SESSION_SECRET` — generate with `openssl rand -base64 48`.
- `ADMIN_PATH` — change this to your own private admin URL segment.
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — the first admin account. Password must
  be at least 12 characters. **Change this password after your first login.**
- `PAYSTACK_SECRET_KEY` — from your Paystack dashboard (Settings → API Keys).
- `NEXT_PUBLIC_SITE_URL` — the public URL of your site (used for Paystack's callback).

Then create the database and seed it:

```bash
npm run setup
```

This creates the tables, the first admin account, eight starter services and one
welcome article. Re-running it is safe — it will not duplicate or overwrite content.

Start the app:

```bash
npm run dev
```

- Public site: `http://localhost:3000`
- Admin portal: `http://localhost:3000/<ADMIN_PATH>/login` (the path you set in `.env`)

## 3. Configure Paystack

In your Paystack dashboard, set the webhook URL to:

```
https://YOUR-DOMAIN/api/paystack/webhook
```

The webhook is how donations are confirmed even if a donor closes their browser
before being redirected back. The redirect-based confirmation (`/treasury/thanks`)
is a convenience for the donor, not the source of truth — `settleDonation()` in
`src/lib/paystack.js` is the only code path that marks a donation successful, and it
always re-checks with Paystack directly.

## 4. Adding your hospital's real content

Nothing about a real hospital, doctor, phone number or address was invented. Log in
to the admin portal and:

1. Go to **Website Settings** and replace every placeholder field (name, tagline,
   about text, address, phone, WhatsApp, email, hours, emergency number, social
   links, Google Maps embed URL).
2. Go to **Doctors / Staff** and add your real team.
3. Go to **Services** and edit or add to the eight starter services.
4. Go to **Gallery** and upload real photos (the home page hero image is pulled from
   the "Hospital" category, so upload one there first).
5. Go to **News** and replace or delete the welcome article.

## 5. Security notes

- Sessions are signed, httpOnly cookies. Patient and admin sessions use separate
  cookies, so one can never be used as the other.
- Passwords are hashed with bcrypt (12 rounds for patients, same for admins, with a
  stronger complexity rule for admin passwords).
- Every state-changing request checks that it came from the site's own origin
  (CSRF defence) in addition to requiring a valid session.
- Login and signup are rate-limited per IP and per account.
- The admin portal path is not a security boundary by itself — it is protected by
  the same session and role checks as every other admin route. Requests to the
  internal folder name (`/admin-portal`) directly are rejected with a 404; only the
  path in `ADMIN_PATH` is rewritten to it.
- Uploaded images are checked by their actual file bytes, not their filename or
  declared type, and SVG is rejected (SVGs can contain scripts).
- Donation amounts are decided by the server and verified against Paystack directly;
  the browser cannot mark a donation successful.
- The CSV export escapes values that could be interpreted as spreadsheet formulas.

### Before going live

- [ ] Change `SESSION_SECRET`, `ADMIN_PATH`, and the seeded admin password.
- [ ] Switch `PAYSTACK_SECRET_KEY` to a live key once you are ready to accept real
      donations, and update the Paystack webhook URL to your live domain.
- [ ] Serve the site over HTTPS (required for secure cookies in production).
- [ ] Consider adding two-factor authentication for admin accounts (not included in
      this version).
- [ ] Consider adding an email-based password reset flow for patients (the current
      "Forgot Password" page asks them to contact the hospital instead).
- [ ] Move uploaded images (`public/uploads`) to persistent storage (a mounted
      volume, or S3-compatible storage) if deploying to a platform with an
      ephemeral filesystem.
- [ ] Have the Privacy Policy and Terms of Use reviewed against the Nigeria Data
      Protection Act (NDPA) 2023 — the included pages are a starting template, not
      legal advice.

## 6. What this version deliberately does not do

- It is not an electronic medical record system. Appointment "reason" and "message"
  fields are short free text, not structured clinical data, and patients are asked
  not to include detailed medical history in them.
- It does not store card details. All payment happens on Paystack's own page.
- It does not let admins mark a donation as paid — only a verified Paystack
  response can do that.

## 7. Project structure

```
prisma/schema.prisma       Database schema
prisma/seed.mjs            First admin, starter services, welcome article
src/lib/                   Server logic: db, session, security, validation, paystack
src/components/            Shared UI and forms (client and server components)
src/app/(public)/          Public pages: home, about, services, team, contact, etc.
src/app/(auth)/            Login, signup, forgot-password
src/app/portal/            Patient dashboard (requires login)
src/app/admin-portal/      Admin dashboard (requires admin login), served at ADMIN_PATH
src/app/api/               All API routes
src/middleware.js          Security headers, admin URL rewriting, portal gate
```
