import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const SERVICES = [
  ["General Consultation", "Check-ups and treatment for everyday illness.", "Our doctors and nurses see patients for general health concerns, ongoing conditions and referrals. Placeholder text: replace this description from the admin portal."],
  ["Maternal Care", "Care for mothers before, during and after birth.", "Support for mothers through pregnancy, delivery and recovery. Placeholder text: replace this description from the admin portal."],
  ["Child Healthcare", "Check-ups, treatment and advice for children.", "Care for babies and children, including routine check-ups and treatment of common childhood illnesses. Placeholder text: replace this description from the admin portal."],
  ["Laboratory Services", "Tests to help diagnose and monitor conditions.", "Laboratory tests that help our clinicians diagnose illness and monitor treatment. Placeholder text: replace this description from the admin portal."],
  ["Pharmacy", "Prescribed medication and advice on using it safely.", "Dispensing of prescribed medication with guidance on how to take it. Placeholder text: replace this description from the admin portal."],
  ["Emergency Care", "Urgent care when it cannot wait.", "Immediate attention for urgent medical situations. In an emergency, use the red Emergency button at the top of any page. Placeholder text: replace this description from the admin portal."],
  ["Antenatal Care", "Regular check-ups for expectant mothers.", "Scheduled visits during pregnancy to monitor the health of mother and baby. Placeholder text: replace this description from the admin portal."],
  ["Minor Surgery", "Small procedures that do not need a long stay.", "Minor surgical procedures carried out safely with same-day discharge where possible. Placeholder text: replace this description from the admin portal."],
];

const slug = (t) => t.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-");

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || "").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "";

  if (!email || password.length < 12) {
    throw new Error("Set SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least 12 characters in .env first.");
  }

  const existing = await db.admin.findUnique({ where: { email } });
  if (!existing) {
    await db.admin.create({
      data: {
        name: "Administrator",
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "SUPER_ADMIN",
      },
    });
    console.log(`Created admin: ${email}`);
  } else {
    console.log(`Admin already exists: ${email} (password not changed)`);
  }

  // Only add starter services if there are none, so re-running never overwrites edits.
  if ((await db.service.count()) === 0) {
    for (const [i, [name, summary, description]] of SERVICES.entries()) {
      await db.service.create({ data: { name, summary, description, slug: slug(name), sortOrder: i } });
    }
    console.log(`Added ${SERVICES.length} starter services.`);
  }

  if ((await db.article.count()) === 0) {
    await db.article.create({
      data: {
        slug: "welcome-to-our-new-website",
        title: "Welcome to our new website",
        category: "Hospital News",
        author: "Hospital Administration",
        excerpt: "You can now book appointments and support patients online.",
        content:
          "This is a placeholder article. You can now create an account, book an appointment and support patients through the Treasury page.\n\nAn administrator can replace or delete this article from the admin portal.",
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    console.log("Added a welcome article.");
  }
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
