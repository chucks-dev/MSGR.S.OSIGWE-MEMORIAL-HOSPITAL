import { db } from "@/lib/db";
import MessagesAdmin from "@/components/MessagesAdmin";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage({ searchParams }) {
  const sp = await searchParams;
  const showArchived = sp.archived === "1";
  const messages = await db.contactMessage.findMany({
    where: { isArchived: showArchived },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <div className="section-head row">
        <h1 style={{ fontSize: "1.6rem", margin: 0 }}>Messages</h1>
        <a className="btn btn-outline btn-sm" href={showArchived ? "?" : "?archived=1"}>
          {showArchived ? "View inbox" : "View archived"}
        </a>
      </div>
      <MessagesAdmin messages={messages} />
    </>
  );
}
