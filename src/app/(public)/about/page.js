import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { PageHero, Paragraphs, Photo } from "@/components/Bits";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const [s, gallery] = await Promise.all([
    getSettings(),
    db.galleryImage.findMany({ where: { category: { in: ["Hospital", "Facilities", "Community Outreach"] } }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  const values = s.coreValues.split("\n").map((v) => v.trim()).filter(Boolean);

  return (
    <>
      <PageHero title={`About ${s.hospitalName}`}>{s.tagline}</PageHero>

      <section className="section">
        <div className="wrap split">
          <div>
            <h2>Who we are</h2>
            <Paragraphs text={s.aboutIntro} />
          </div>
          <Photo src={gallery[0]?.imageUrl} alt="The hospital" className="round-img" icon="cross" ratio="4 / 3" />
        </div>
      </section>

      <section className="section tint">
        <div className="wrap split flip">
          <div>
            <h2>Our history</h2>
            <Paragraphs text={s.aboutHistory} />
          </div>
          <Photo src={gallery[1]?.imageUrl} alt="Hospital facilities" className="round-img" icon="cross" ratio="4 / 3" />
        </div>
      </section>

      <section className="section">
        <div className="wrap grid cols-2">
          <div className="panel">
            <h2>Our mission</h2>
            <p>{s.mission}</p>
          </div>
          <div className="panel" style={{ marginTop: 0 }}>
            <h2>Our vision</h2>
            <p>{s.vision}</p>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="wrap">
          <h2>Our core values</h2>
          <ul className="grid cols-3" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {values.map((v) => (
              <li key={v} className="card">
                <div className="card-body"><h3>{v}</h3></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div>
            <h2>Rooted in our community</h2>
            <Paragraphs text={s.communityFocus} />
          </div>
          <Photo src={gallery[2]?.imageUrl} alt="Community outreach" className="round-img" icon="heart" ratio="4 / 3" />
        </div>
      </section>
    </>
  );
}
