import Link from "next/link";
import {
  Award,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata = {
  title: "About | SkillBridge",
  description: "Learn how SkillBridge connects students with trusted mentors.",
};

const values = [
  {
    icon: Users,
    title: "Verified mentors",
    text: "Tutors are reviewed before they can teach, so students can book sessions with confidence.",
  },
  {
    icon: CalendarCheck,
    title: "Structured booking",
    text: "Students select a tutor, course, slot, and payment before a booking reaches the tutor.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent records",
    text: "Payments, invoices, certificates, reviews, and notifications stay organized in role-based dashboards.",
  },
];

const stats = [
  { label: "Role-based dashboards", value: "3" },
  { label: "Learning categories", value: "8+" },
  { label: "Core booking steps", value: "5" },
  { label: "Secure records", value: "24/7" },
];

const flow = [
  "Choose a mentor",
  "Select a course",
  "Pick an available slot",
  "Pay before confirmation",
  "Complete session and collect records",
];

const platformHighlights = [
  {
    icon: CreditCard,
    title: "Payment-first booking",
    text: "Bookings are created after payment initiation, and tutors can confirm only when payment is completed.",
  },
  {
    icon: MessageSquare,
    title: "Clear communication",
    text: "Contact messages, notifications, reviews, and status updates keep every user informed.",
  },
  {
    icon: Award,
    title: "Learning proof",
    text: "Completed sessions can issue certificates with view, print, download, and QR verification support.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-[80vh] bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
      <section className="border-b bg-[radial-gradient(circle_at_top_left,rgba(97,31,105,0.14),transparent_34%),linear-gradient(180deg,rgba(97,31,105,0.06),transparent)] px-4 py-16 dark:bg-[radial-gradient(circle_at_top_left,rgba(192,132,252,0.18),transparent_34%),linear-gradient(180deg,rgba(192,132,252,0.08),transparent)] sm:px-6 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#611f69]/20 bg-white px-3 py-1 text-xs font-semibold text-[#611f69] shadow-sm dark:border-[#c084fc]/30 dark:bg-gray-900 dark:text-[#c084fc]">
              <Sparkles className="h-3.5 w-3.5" />
              Built for guided learning
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              A smarter bridge between students, tutors, and real progress.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-300 md:text-lg">
              SkillBridge brings discovery, paid booking, tutor confirmation,
              session records, invoices, reviews, certificates, notifications,
              and dashboards into one organized learning workflow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#611f69] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]"
              >
                Explore Courses
              </Link>
              <Link
                href="/mentors"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 px-5 text-sm font-semibold text-gray-800 transition-colors hover:border-[#611f69] hover:text-[#611f69] dark:border-gray-700 dark:text-gray-200 dark:hover:border-[#c084fc] dark:hover:text-[#c084fc]"
              >
                Meet Mentors
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="rounded-xl bg-[#611f69] p-6 text-white dark:bg-[#c084fc] dark:text-black">
              <GraduationCap className="h-10 w-10" />
              <h2 className="mt-5 text-2xl font-bold">
                Learning that leaves a record
              </h2>
              <p className="mt-3 text-sm leading-6 opacity-90">
                Every important step is trackable: payment, booking status,
                tutor confirmation, session completion, review, invoice, and
                certificate.
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950"
                >
                  <p className="text-2xl font-bold text-[#611f69] dark:text-[#c084fc]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
              Our mission
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Make expert guidance easier to discover, book, and trust.
            </h2>
          </div>
          <p className="text-base leading-8 text-gray-600 dark:text-gray-300">
            Students often need focused help, not endless browsing. Tutors need
            a clean place to manage availability, sessions, courses, reviews,
            and earnings. Admins need visibility across users, bookings,
            payments, courses, contact messages, and platform activity.
            SkillBridge ties those needs together with a workflow that is
            practical for real learning.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-14 dark:bg-gray-900/45 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
              Booking flow
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              From discovery to confirmed session
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {flow.map((step, index) => (
              <div
                key={step}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#611f69] text-sm font-bold text-white dark:bg-[#c084fc] dark:text-black">
                  {index + 1}
                </span>
                <p className="mt-4 text-sm font-semibold leading-6">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-3">
        {values.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <Icon className="h-8 w-8 text-[#611f69] dark:text-[#c084fc]" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {text}
            </p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
                Platform strengths
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Built around accountability, not just browsing.
              </h2>
              <div className="mt-6 space-y-3">
                {[
                  "Secure student payment records",
                  "Tutor confirmation after payment",
                  "Admin oversight for users and content",
                  "Readable invoices and certificates",
                ].map((item) => (
                  <p
                    key={item}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {platformHighlights.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-xl bg-gray-50 p-5 dark:bg-gray-950"
                >
                  <Icon className="h-7 w-7 text-[#611f69] dark:text-[#c084fc]" />
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
