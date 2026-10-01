import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Badge, EmptyState } from "@/components/Bits";
import { APPOINTMENT_BADGE, formatDate, formatTime } from "@/lib/format";

export const metadata = { title: "My Appointments" };

export default async function PatientAppointmentsPage() {
  const user = await getCurrentUser();
  const appointments = await db.appointment.findMany({
    where: { userId: user.id },
    orderBy: { preferredDate: "desc" },
    include: { service: true, doctor: true },
  });

  return (
    <div className="panel">
      <div className="section-head row">
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>My Appointments</h1>
        <Link href="/appointments" className="btn btn-primary btn-sm">Book New Appointment</Link>
      </div>

      {appointments.length === 0 ? (
        <EmptyState title="No appointments yet">
          <Link href="/appointments">Book your first appointment</Link>.
        </EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Service</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.service.name}</td>
                  <td>{a.doctor ? a.doctor.name : "No preference"}</td>
                  <td>{formatDate(a.preferredDate)}</td>
                  <td>{formatTime(a.preferredTime)}</td>
                  <td><Badge map={APPOINTMENT_BADGE} value={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
