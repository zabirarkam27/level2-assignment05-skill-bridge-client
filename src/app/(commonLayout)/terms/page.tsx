import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | MentorForge",
  description: "Terms for students, tutors, and admins using MentorForge.",
};

const termsSections = [
  {
    title: "Account Responsibilities",
    points: [
      "Users must provide accurate profile, contact, and role information.",
      "Students, tutors, and admins are responsible for keeping account credentials secure.",
      "Role-based dashboard access must be used only for the features assigned to that role.",
    ],
  },
  {
    title: "Bookings and Tutor Confirmation",
    points: [
      "Students select a tutor, course, and available slot before submitting a booking.",
      "Payment must be completed before a booking can move into the tutor confirmation flow.",
      "Tutors should confirm only sessions they can attend and must keep availability up to date.",
    ],
  },
  {
    title: "Payments, Invoices, and Records",
    points: [
      "Stripe payment records, invoice previews, and downloadable invoices are stored for user reference.",
      "Students should verify price, course, tutor, and session time before completing payment.",
      "Admins may review payment and booking records to resolve support or audit issues.",
    ],
  },
  {
    title: "Cancellation and Completion Rules",
    points: [
      "Students may cancel pending bookings before tutor confirmation.",
      "Confirmed-session cancellation is restricted to admins to protect tutor and student schedules.",
      "A session can be marked completed only after the scheduled date and time have passed.",
    ],
  },
  {
    title: "Reviews, Certificates, and Content",
    points: [
      "Reviews should reflect real completed learning sessions and must not include abusive content.",
      "Certificates are generated from eligible completed sessions and may include verification details.",
      "Blog posts, course details, and profile content should be accurate, respectful, and relevant.",
    ],
  },
  {
    title: "Platform Safety",
    points: [
      "MentorForge may restrict access when suspicious, abusive, or unauthorized activity is detected.",
      "Admins may moderate users, tutor requests, courses, blogs, bookings, and contact messages.",
      "Users should contact support if they notice incorrect records or unexpected dashboard behavior.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-[80vh] bg-white px-4 py-14 text-gray-900 dark:bg-gray-950 dark:text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-gray-200 bg-linear-to-br from-[#611f69]/10 via-white to-white p-6 dark:border-gray-800 dark:from-[#c084fc]/15 dark:via-gray-950 dark:to-gray-950 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
            MentorForge policies
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
            Terms & Conditions
          </h1>
          <p className="mt-4 max-w-3xl leading-8 text-gray-600 dark:text-gray-300">
            These terms explain the expected use of MentorForge for students,
            tutors, and admins. They are written for the assignment project and
            should be reviewed by a legal professional before real commercial
            use.
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          {termsSections.map((section, index) => (
            <section
              key={section.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#611f69] text-sm font-bold text-white dark:bg-[#c084fc] dark:text-black">
                  {index + 1}
                </span>
                <div>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  <div className="mt-4 grid gap-3">
                    {section.points.map((point) => (
                      <p
                        key={point}
                        className="flex gap-2 text-sm leading-7 text-gray-600 dark:text-gray-300"
                      >
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{point}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
