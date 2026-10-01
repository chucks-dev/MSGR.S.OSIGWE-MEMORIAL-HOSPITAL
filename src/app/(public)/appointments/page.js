import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { PageHero } from "@/components/Bits";
import AppointmentForm from "@/components/AppointmentForm";

export const metadata = { title: "Book an Appointment" };

export default async function AppointmentsPage({ searchParams }) {
  const { service } = await searchParams;
  const user = await getCurrentUser();

  const [services, doctors] = user
    ? await Promise.all([
        db.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
        db.doctor.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true, specialization: true } }),
      ])
    : [[], []];

  const next = `/appointments${service ? `?service=${encodeURIComponent(service)}` : ""}`;

  return (
    <>
      <PageHero title="Book an Appointment">Tell us when you would like to visit and we will confirm.</PageHero>
      <section className="section">
        <div className="wrap auth-wrap" style={{ maxWidth: 640 }}>
          {user ? (
            <div className="form-card">
              <p style={{ color: "var(--ink-soft)" }}>Booking as <strong>{user.fullName}</strong>.</p>
              <AppointmentForm services={services} doctors={doctors} defaultServiceId={service} />
            </div>
          ) : (
            <div className="form-card">
              <h2 style={{ fontSize: "1.5rem" }}>Log in to book</h2>
              <p>
                You need an account to request an appointment, so we can show you its status and keep your details safe.
              </p>
              <div className="btn-row">
                <Link href="/login" className="btn btn-primary">Login</Link>
                <Link href="/signup" className="btn btn-outline">Create Account</Link>
              </div>
              <p style={{ marginTop: "1rem", color: "var(--ink-soft)" }}>
                In an emergency, do not wait. Use the red Emergency button at the top of the page.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
