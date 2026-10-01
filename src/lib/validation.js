import { z } from "zod";

/** Accepts 08012345678, 8012345678, +2348012345678, 2348012345678.
 *  Returns the +234 form, or null if it is not a valid Nigerian number. */
export function normalizeNigerianPhone(input) {
  const digits = String(input || "").replace(/[\s\-()]/g, "");
  let m = digits.match(/^(?:\+?234|0)?([789][01]\d{8})$/);
  if (!m) return null;
  return `+234${m[1]}`;
}

const phone = z
  .string()
  .trim()
  .min(1, "Enter your phone number.")
  .transform((v, ctx) => {
    const n = normalizeNigerianPhone(v);
    if (!n) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid Nigerian phone number, for example 08012345678.",
      });
      return z.NEVER;
    }
    return n;
  });

const email = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .email("Enter a valid email address, for example name@example.com.")
  .max(254)
  .transform((v) => v.toLowerCase());

export const passwordRules = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.")
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/\d/, "Include a number.");

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(100),
    email,
    address: z.string().trim().min(5, "Enter your home address.").max(250),
    phone,
    password: passwordRules,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(72),
  remember: z.boolean().optional().default(false),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(100),
  address: z.string().trim().min(5, "Enter your home address.").max(250),
  phone,
});

export const appointmentSchema = z.object({
  serviceId: z.string().min(1, "Choose a service."),
  doctorId: z.string().optional().nullable().transform((v) => v || null),
  preferredDate: z
    .string()
    .min(1, "Choose a date.")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Choose a valid date.")
    .refine((v) => {
      const d = new Date(v);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    }, "Choose today or a future date."),
  preferredTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid time."),
  reason: z.string().trim().min(3, "Tell us briefly why you are visiting.").max(300),
  message: z.string().trim().max(1000).optional().nullable().transform((v) => v || null),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email,
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v, ctx) => {
      if (!v) return null;
      const n = normalizeNigerianPhone(v);
      if (!n) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid Nigerian phone number." });
        return z.NEVER;
      }
      return n;
    }),
  subject: z.string().trim().min(2, "Enter a subject.").max(150),
  message: z.string().trim().min(10, "Write at least 10 characters.").max(3000),
});

export const DONATION_PURPOSES = [
  "General Hospital Support",
  "Patient Medical Treatment",
  "Medication",
  "Emergency Care",
  "Maternal & Child Care",
];

export const donationSchema = z.object({
  // Naira, whole numbers. Converted to kobo on the server.
  amountNaira: z.coerce
    .number({ invalid_type_error: "Enter an amount." })
    .int("Enter a whole number of naira.")
    .min(500, "The minimum donation is ₦500.")
    .max(5_000_000, "For gifts above ₦5,000,000, please contact the hospital."),
  purpose: z.enum(DONATION_PURPOSES, { errorMap: () => ({ message: "Choose a purpose." }) }),
  donorName: z.string().trim().min(2, "Enter your name.").max(100),
  donorEmail: email,
  donorPhone: phone,
  isAnonymous: z.boolean().optional().default(false),
});

/** Turns a Zod error into { fieldName: "message" } for forms. */
export function fieldErrors(zodError) {
  const out = {};
  for (const issue of zodError.issues) {
    const k = issue.path[0] ?? "form";
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/* ---------- Admin content schemas ---------- */

export const doctorSchema = z.object({
  name: z.string().trim().min(2, "Enter a name.").max(100),
  position: z.string().trim().min(2, "Enter a position.").max(100),
  specialization: z.string().trim().min(2, "Enter a specialization.").max(100),
  bio: z.string().trim().min(10, "Write a short biography.").max(1500),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Enter a service name.").max(100),
  summary: z.string().trim().min(10, "Write a short summary.").max(200),
  description: z.string().trim().min(20, "Write a fuller description.").max(4000),
});

export const NEWS_CATEGORIES = [
  "Health Tips",
  "Hospital News",
  "Community Outreach",
  "Medical Awareness",
  "Events",
];

export const GALLERY_CATEGORIES = [
  "Hospital",
  "Medical Team",
  "Facilities",
  "Community Outreach",
  "Events",
];

export const articleSchema = z.object({
  title: z.string().trim().min(3, "Enter a title.").max(150),
  category: z.enum(NEWS_CATEGORIES, { errorMap: () => ({ message: "Choose a category." }) }),
  author: z.string().trim().min(2, "Enter an author.").max(100),
  excerpt: z.string().trim().min(10, "Write a short excerpt.").max(300),
  content: z.string().trim().min(20, "Write the article content.").max(20000),
});

export const galleryImageSchema = z.object({
  caption: z.string().trim().min(2, "Enter a caption.").max(150),
  category: z.enum(GALLERY_CATEGORIES, { errorMap: () => ({ message: "Choose a category." }) }),
});
