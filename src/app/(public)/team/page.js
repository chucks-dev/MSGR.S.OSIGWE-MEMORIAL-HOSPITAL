import { db } from "@/lib/db";
import { PageHero, Photo, EmptyState, Paragraphs } from "@/components/Bits";

export const metadata = { title: "Our Team" };

export default async function TeamPage() {
  const doctors = await db.doctor.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

  return (
    <>
      <PageHero title="Our Team">The doctors, nurses and staff who care for our community.</PageHero>
      <section className="section">
        <div className="wrap">
          {doctors.length === 0 ? (
            <EmptyState title="Team profiles coming soon">An administrator can add staff from the admin portal.</EmptyState>
          ) : (
            <div className="grid cols-3">
              {doctors.map((d) => (
                <article className="card person" key={d.id}>
                  <Photo src={d.photoUrl} alt={d.name} className="avatar" icon="user" ratio="4 / 4.2" />
                  <div className="card-body">
                    <h3>{d.name}</h3>
                    <span className="role">{d.position}</span>
                    <span className="spec">{d.specialization}</span>
                    <div style={{ marginTop: "0.5rem", color: "var(--ink-soft)", fontSize: "0.98rem" }}>
                      <Paragraphs text={d.bio} />
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
