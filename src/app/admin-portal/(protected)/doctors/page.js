import { db } from "@/lib/db";
import DoctorsAdmin from "@/components/DoctorsAdmin";

export const metadata = { title: "Doctors / Staff" };

export default async function AdminDoctorsPage() {
  const doctors = await db.doctor.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return <DoctorsAdmin doctors={doctors} />;
}
