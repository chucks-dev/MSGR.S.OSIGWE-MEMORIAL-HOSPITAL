import { getCurrentUser } from "@/lib/session";
import ProfileForm from "@/components/ProfileForm";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  return (
    <div className="panel" style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: "1.5rem" }}>My Profile</h1>
      <ProfileForm user={user} />
    </div>
  );
}
