import { db } from "@/lib/db";
import ServicesAdmin from "@/components/ServicesAdmin";

export const metadata = { title: "Services" };

export default async function AdminServicesPage() {
  const services = await db.service.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return <ServicesAdmin services={services} />;
}
