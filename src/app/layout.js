import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { getSettings, SETTING_FIELDS } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

export async function generateMetadata() {
  let s;

  try {
    s = await getSettings();
  } catch (error) {
    console.error("Failed to load site settings for metadata:", error);

    s = Object.fromEntries(
      SETTING_FIELDS.map((field) => [field.key, field.default])
    );
  }

  return {
    title: {
      default: `${s.hospitalName} | ${s.tagline}`,
      template: `%s | ${s.hospitalName}`,
    },
    description: s.heroText,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f2a4a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
