import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { EmptyState } from "@/components/Bits";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const notifications = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });

  // Mark as read on view; best-effort, does not block rendering.
  if (notifications.some((n) => !n.isRead)) {
    db.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } }).catch(() => {});
  }

  return (
    <div className="panel">
      <h1 style={{ fontSize: "1.5rem" }}>Notifications</h1>
      {notifications.length === 0 ? (
        <EmptyState title="Nothing here yet">You will see updates about your appointments and donations here.</EmptyState>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.75rem" }}>
          {notifications.map((n) => (
            <li key={n.id} style={{ borderBottom: "1px solid var(--mist)", paddingBottom: "0.75rem" }}>
              <strong style={{ color: "var(--navy)" }}>{n.title}</strong>
              <p style={{ margin: "0.2rem 0 0" }}>{n.body}</p>
              <span className="meta">{formatDateTime(n.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
