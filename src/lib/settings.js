import { cache } from "react";
import { db } from "./db";

/**
 * Every piece of hospital-specific text lives here, with an obvious placeholder
 * default. The admin "Website Settings" page overwrites these values, so nothing
 * needs to be edited in code. Nothing below is real: no real phone numbers,
 * addresses, or credentials are invented.
 */
export const SETTING_FIELDS = [
  { key: "hospitalName", label: "Hospital name", default: "MSGR.S.OSIGWE, MEMORIAL HOSPITAL", group: "Identity" },
  { key: "tagline", label: "Tagline", default: "Your Trusted Healthcare Partner", group: "Identity" },
  { key: "heroHeadline", label: "Home page headline", default: "MSGR.S.OSIGWE, MEMORIAL HOSPITAL", group: "Home page" },
  {
    key: "heroText",
    label: "Home page introduction",
    default: "Providing reliable, affordable and compassionate healthcare services to our community.",
    group: "Home page",
    long: true,
  },
  {
    key: "aboutIntro",
    label: "About: introduction",
    default:
      "MSGR.S.OSIGWE, MEMORIAL HOSPITAL is a placeholder description. Replace this text from Website Settings with a short introduction to your hospital and the community you serve.",
    group: "About page",
    long: true,
  },
  {
    key: "aboutHistory",
    label: "About: history",
    default: "Placeholder history. Replace this with the story of how the hospital began and how it has grown.",
    group: "About page",
    long: true,
  },
  {
    key: "mission",
    label: "Mission",
    default: "To provide reliable, affordable and compassionate healthcare to every person in our community.",
    group: "About page",
    long: true,
  },
  {
    key: "vision",
    label: "Vision",
    default: "A healthier community where quality care is within reach of everyone.",
    group: "About page",
    long: true,
  },
  {
    key: "coreValues",
    label: "Core values (one per line)",
    default: "Compassion\nIntegrity\nRespect\nExcellence\nService to community",
    group: "About page",
    long: true,
  },
  {
    key: "communityFocus",
    label: "About: community focus",
    default: "Placeholder text about outreach programmes and how the hospital serves the surrounding villages.",
    group: "About page",
    long: true,
  },
  { key: "address", label: "Address", default: "Hospital address to be added", group: "Contact" },
  { key: "phone", label: "Phone number", default: "", group: "Contact" },
  { key: "whatsapp", label: "WhatsApp number", default: "", group: "Contact" },
  { key: "email", label: "Email address", default: "", group: "Contact" },
  { key: "emergencyPhone", label: "Emergency phone number", default: "", group: "Contact" },
  { key: "hours", label: "Opening hours", default: "Hours to be added", group: "Contact", long: true },
  { key: "mapEmbedUrl", label: "Google Maps embed URL", default: "", group: "Contact" },
  { key: "facebook", label: "Facebook page URL", default: "", group: "Social media" },
  { key: "instagram", label: "Instagram URL", default: "", group: "Social media" },
  { key: "x", label: "X (Twitter) URL", default: "", group: "Social media" },
];

export const getSettings = cache(async () => {
  const rows = await db.siteSetting.findMany();
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const out = {};
  for (const f of SETTING_FIELDS) {
    out[f.key] = stored[f.key] !== undefined ? stored[f.key] : f.default;
  }
  return out;
});

/** Digits only, in the +234 form Nigerian tel: and wa.me links expect. */
export function toTelHref(number) {
  const digits = String(number || "").replace(/[^\d+]/g, "");
  if (!digits) return "";
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.startsWith("234")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+234${digits.slice(1)}`;
  return `tel:${digits}`;
}

export function toWhatsAppHref(number) {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits) return "";
  const intl = digits.startsWith("234") ? digits : digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}
