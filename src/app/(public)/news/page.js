import Link from "next/link";
import { db } from "@/lib/db";
import { PageHero, Photo, EmptyState } from "@/components/Bits";
import { formatDate } from "@/lib/format";

export const metadata = { title: "News" };

const PAGE_SIZE = 9;
const CATEGORIES = ["Health Tips", "Hospital News", "Community Outreach", "Medical Awareness", "Events"];

export default async function NewsPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const category = CATEGORIES.includes(sp.category) ? sp.category : null;

  const where = { isPublished: true, ...(category ? { category } : {}) };
  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.article.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHero title="News & Health Information">Updates, health tips and stories from the hospital.</PageHero>
      <section className="section">
        <div className="wrap">
          <div className="chips" role="group" aria-label="Filter by category">
            <Link href="/news" className="chip" aria-current={!category}>All</Link>
            {CATEGORIES.map((c) => (
              <Link key={c} href={`/news?category=${encodeURIComponent(c)}`} className="chip" aria-current={category === c}>
                {c}
              </Link>
            ))}
          </div>

          {articles.length === 0 ? (
            <EmptyState title="No articles yet">Check back soon for hospital news and health tips.</EmptyState>
          ) : (
            <>
              <div className="grid cols-3">
                {articles.map((a) => (
                  <article className="card" key={a.id}>
                    <Photo src={a.imageUrl} alt={a.title} className="card-img" icon="cross" />
                    <div className="card-body">
                      <span className="badge" style={{ alignSelf: "flex-start" }}>{a.category}</span>
                      <h3><Link href={`/news/${a.slug}`} style={{ textDecoration: "none" }}>{a.title}</Link></h3>
                      <p>{a.excerpt}</p>
                      <div className="meta">
                        <span>{a.author}</span><span>&middot;</span><span>{formatDate(a.publishedAt)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {pages > 1 && (
                <nav className="pager" aria-label="News pages">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/news?${new URLSearchParams({ ...(category ? { category } : {}), page: String(p) })}`}
                      className="chip"
                      aria-current={p === page}
                    >
                      {p}
                    </Link>
                  ))}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
