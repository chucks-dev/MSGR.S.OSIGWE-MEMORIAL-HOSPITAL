import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHero, Photo, Paragraphs } from "@/components/Bits";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = await db.article.findUnique({ where: { slug } });
  return { title: a ? a.title : "Article" };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await db.article.findUnique({ where: { slug } });
  if (!article || !article.isPublished) notFound();

  const related = await db.article.findMany({
    where: { isPublished: true, category: article.category, id: { not: article.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <>
      <PageHero title={article.title}>
        {article.author} &middot; {formatDate(article.publishedAt)} &middot; {article.category}
      </PageHero>
      <section className="section">
        <div className="wrap">
          {article.imageUrl && <Photo src={article.imageUrl} alt={article.title} className="round-img" ratio="16 / 8" />}
          <div className="article-body" style={{ marginTop: article.imageUrl ? "2rem" : 0 }}>
            <Paragraphs text={article.content} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section tint">
          <div className="wrap">
            <h2>Related articles</h2>
            <div className="grid cols-3">
              {related.map((a) => (
                <article className="card" key={a.id}>
                  <Photo src={a.imageUrl} alt={a.title} className="card-img" icon="cross" />
                  <div className="card-body">
                    <h3><Link href={`/news/${a.slug}`} style={{ textDecoration: "none" }}>{a.title}</Link></h3>
                    <p>{a.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
