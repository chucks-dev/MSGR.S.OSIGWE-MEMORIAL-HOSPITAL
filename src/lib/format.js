export const naira = (n) => `₦${Number(n).toLocaleString("en-NG")}`;

export const nairaFromKobo = (k) => naira(k / 100);

export function formatDate(d, opts = { day: "numeric", month: "long", year: "numeric" }) {
  return new Date(d).toLocaleDateString("en-NG", opts);
}

export function formatDateTime(d) {
  return new Date(d).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "14:30" -> "2:30 PM" */
export function formatTime(t) {
  const [h, m] = String(t).split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

export const APPOINTMENT_BADGE = {
  PENDING: { label: "Pending", cls: "amber" },
  CONFIRMED: { label: "Confirmed", cls: "green" },
  COMPLETED: { label: "Completed", cls: "" },
  CANCELLED: { label: "Cancelled", cls: "gray" },
};

export const DONATION_BADGE = {
  PENDING: { label: "Pending", cls: "amber" },
  SUCCESSFUL: { label: "Successful", cls: "green" },
  FAILED: { label: "Failed", cls: "red" },
  CANCELLED: { label: "Cancelled", cls: "gray" },
};

/** Splits plain text into paragraphs. React escapes the text, so this is XSS-safe. */
export function paragraphs(text) {
  return String(text || "")
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
