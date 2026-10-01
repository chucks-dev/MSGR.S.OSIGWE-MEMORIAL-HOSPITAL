import { SETTING_FIELDS, getSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";

export const metadata = { title: "Website Settings" };

export default async function AdminSettingsPage() {
  const values = await getSettings();
  return (
    <>
      <h1 style={{ fontSize: "1.6rem" }}>Website Settings</h1>
      <p style={{ color: "var(--ink-soft)" }}>
        This text appears across the public website. Replace the placeholder content with your hospital&apos;s real details.
      </p>
      <SettingsForm fields={SETTING_FIELDS} values={values} />
    </>
  );
}
