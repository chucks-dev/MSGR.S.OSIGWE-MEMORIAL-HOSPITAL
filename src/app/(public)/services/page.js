import Link from "next/link";
import { db } from "@/lib/db";
import { PageHero, Photo, EmptyState } from "@/components/Bits";
import { Icon, serviceIcon } from "@/components/Icons";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const services = await db.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

  return (
    <>
      <PageHero title="Our Services">Care for every member of your family, close to home.</PageHero>
      <section className="section">
        <div className="wrap">
          {services.length === 0 ? (
            <EmptyState title="No services listed yet">An administrator can add services from the admin portal.</EmptyState>
          ) : (
            <div className="grid cols-3">
              {services.map((sv) => (
                <article className="card" key={sv.id}>
                  {sv.imageUrl ? (
                    <Photo src={sv.imageUrl} alt={sv.name} className="card-img" />
                  ) : null}
                  <div className="card-body">
                    {!sv.imageUrl && <div className="icon-tile"><Icon name={serviceIcon(sv.name)} /></div>}
                    <h3>{sv.name}</h3>
                    <p>{sv.summary}</p>
                    <div className="card-actions">
                      <Link href={`/services/${sv.slug}`} className="btn btn-outline btn-sm">Learn More</Link>
                      <Link href={`/appointments?service=${sv.id}`} className="btn btn-primary btn-sm">Book Appointment</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
