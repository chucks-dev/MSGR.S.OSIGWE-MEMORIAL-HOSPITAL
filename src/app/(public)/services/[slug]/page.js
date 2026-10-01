import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHero, Paragraphs, Photo } from "@/components/Bits";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const sv = await db.service.findUnique({ where: { slug } });
  return { title: sv ? sv.name : "Service" };
}

export default async function ServiceDetail({ params }) {
  const { slug } = await params;
  const sv = await db.service.findUnique({ where: { slug } });
  if (!sv || !sv.isActive) notFound();

  return (
    <>
      <PageHero title={sv.name}>{sv.summary}</PageHero>
      <section className="section">
        <div className="wrap split">
          <div>
            <Paragraphs text={sv.description} />
            <div className="btn-row">
              <Link href={`/appointments?service=${sv.id}`} className="btn btn-primary">Book Appointment</Link>
              <Link href="/services" className="btn btn-outline">All Services</Link>
            </div>
          </div>
          {sv.imageUrl && <Photo src={sv.imageUrl} alt={sv.name} className="round-img" ratio="4 / 3" />}
        </div>
      </section>
    </>
  );
}
