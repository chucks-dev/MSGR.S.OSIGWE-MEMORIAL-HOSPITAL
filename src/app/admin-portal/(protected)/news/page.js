import { db } from "@/lib/db";
import NewsAdmin from "@/components/NewsAdmin";

export const metadata = { title: "News" };

export default async function AdminNewsPage() {
  const articles = await db.article.findMany({ orderBy: { createdAt: "desc" } });
  return <NewsAdmin articles={articles} />;
}
