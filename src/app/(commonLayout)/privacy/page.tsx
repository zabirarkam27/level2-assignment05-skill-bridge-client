import { LockKeyhole, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | SkillBridge",
  description: "How SkillBridge handles account, booking, and payment data.",
};

const policySections = [
  {
    title: "Information We Collect",
    body: "SkillBridge may store account details, profile images, email addresses, tutor profiles, course information, availability slots, booking records, payment references, invoice data, certificates, wishlist items, reviews, notifications, blogs, and contact messages.",
  },
  {
    title: "How We Use Your Information",
    body: "We use data to authenticate users, route students to tutors, process payment-first bookings, generate invoices and certificates, show dashboard analytics, send notifications, support search, and help admins manage the platform.",
  },
  {
    title: "Payments and Transaction Records",
    body: "Payment processing is handled through Stripe. SkillBridge stores transaction IDs, payment status, amount, gateway name, and related booking records so students, tutors, and admins can verify payment history.",
  },
  {
    title: "Calendar and Meeting Data",
    body: "When calendar integration is configured, SkillBridge may store Google event IDs or meeting links for confirmed sessions. These records are used only to support scheduling, reminders, and joining sessions.",
  },
  {
    title: "Role-Based Access",
    body: "Students, tutors, and admins see different dashboard data. Admin-only data such as user management, contact messages, global analytics, and sensitive moderation actions is protected by role checks.",
  },
  {
    title: "Data Security",
    body: "The project uses validation, protected routes, secure authentication flows, hashed credentials where applicable, restricted dashboard actions, and server-side permission checks to reduce unauthorized access risk.",
  },
  {
    title: "Data Retention",
    body: "Booking, payment, certificate, review, and notification records may remain available while the account or assignment database is active. Admins may remove or update records when needed for moderation or support.",
  },
  {
    title: "Your Choices",
    body: "Users can update profile information, remove wishlist items, read or clear notifications, and contact support about incorrect booking, payment, certificate, or profile records.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-[80vh] bg-white px-4 py-14 text-gray-900 dark:bg-gray-950 dark:text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 rounded-3xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[1fr_auto] md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
              Standard data notice
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 max-w-3xl leading-8 text-gray-600 dark:text-gray-300">
              This policy explains how SkillBridge handles data for learning,
              tutor booking, payment, dashboard, notification, and certificate
              features.
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#611f69] text-white dark:bg-[#c084fc] dark:text-black">
            <ShieldCheck className="h-8 w-8" />
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {policySections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <LockKeyhole className="h-5 w-5 text-[#611f69] dark:text-[#c084fc]" />
              <h2 className="mt-4 text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          This privacy policy is project documentation for SkillBridge. For a
          real production launch, review it with legal and compliance guidance.
        </p>
      </div>
    </main>
  );
}
