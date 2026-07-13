import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Heart,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { BlogPost, Category, Course, Mentor, Review } from "@/types/routes.type";
import { getPublicApiBases } from "@/lib/public-api";
import { getAvatarUrl } from "@/lib/avatar";
import { COURSE_PLACEHOLDER_IMAGE } from "@/components/courses/CourseCard";
import CategoryCoursesSection from "@/components/home-page/CategoryCoursesSection";
import HeroSlider from "@/components/home-page/HeroSlider";

type ApiResponse<T> = {
  data?: T;
  meta?: {
    total?: number;
  };
};

const CERTIFICATE_IMAGE =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&q=80";

const bookingFlow = [
  "Select Tutor",
  "Choose Course",
  "Pick Slot",
  "Pay Securely",
  "Tutor Confirms",
];

async function fetchPublic<T>(path: string): Promise<T | null> {
  for (const baseUrl of getPublicApiBases()) {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        next: { revalidate: 60 },
      });

      if (!res.ok) continue;
      return (await res.json()) as T;
    } catch {
      continue;
    }
  }

  return null;
}

function truncate(text = "", length = 130) {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}...`;
}

export default async function Home() {
  const [coursesRes, popularRes, categoriesRes, mentorsRes, reviewsRes, blogsRes] =
    await Promise.all([
      fetchPublic<ApiResponse<Course[]>>("/courses?page=1&limit=4"),
      fetchPublic<ApiResponse<Course[]>>("/courses/popular"),
      fetchPublic<ApiResponse<Category[]>>("/categories"),
      fetchPublic<ApiResponse<Mentor[]>>("/mentors"),
      fetchPublic<ApiResponse<Review[]>>("/reviews"),
      fetchPublic<ApiResponse<BlogPost[]>>("/blogs"),
    ]);

  const courses = coursesRes?.data ?? [];
  const popularCourses = (popularRes?.data ?? courses).slice(0, 4);
  const categories = (categoriesRes?.data ?? []).slice(0, 8);
  const mentors = mentorsRes?.data ?? [];
  const featuredMentor = mentors[0];
  const compactMentors = mentors.slice(1, 4);
  const reviews = (reviewsRes?.data ?? []).slice(0, 3);
  const blogs = (blogsRes?.data ?? []).slice(0, 3);

  const stats = [
    {
      label: "Courses",
      value: coursesRes?.meta?.total ?? courses.length,
      icon: BookOpen,
    },
    {
      label: "Mentors",
      value: mentors.length,
      icon: Users,
    },
    {
      label: "Categories",
      value: categoriesRes?.data?.length ?? categories.length,
      icon: Sparkles,
    },
    {
      label: "Reviews",
      value: reviewsRes?.data?.length ?? reviews.length,
      icon: Star,
    },
  ];

  return (
    <main className="min-h-[80vh] bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
      <HeroSlider />

      <section className="border-b border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-gray-950 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-4 dark:border-gray-800"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#611f69]/10 text-[#611f69] dark:bg-[#c084fc]/15 dark:text-[#c084fc]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-14 dark:bg-gray-900/45 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
                Guided workflow
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                A booking path that keeps everyone accountable.
              </h2>
            </div>
            <p className="text-base leading-8 text-gray-600 dark:text-gray-300">
              Students do not need to guess what happens next. SkillBridge
              moves each session through a clear flow: choose, pay, book,
              confirm, complete, review, and download records.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {bookingFlow.map((step, index) => (
              <div
                key={step}
                className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
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

      <CategoryCoursesSection />

      <section className="bg-gray-50 px-4 py-14 dark:bg-gray-900/45 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
                Featured course
              </p>
              {popularCourses[0] ? (
                <Link href={`/courses/${popularCourses[0].id}`}>
                  <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-xl">
                    <Image
                      src={popularCourses[0].image || COURSE_PLACEHOLDER_IMAGE}
                      alt={popularCourses[0].title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 540px"
                    />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold">
                    {popularCourses[0].title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {truncate(popularCourses[0].description || "", 170)}
                  </p>
                </Link>
              ) : (
                <p className="mt-5 text-sm text-gray-500">
                  Popular courses will appear here soon.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
                  Popular courses
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">
                  Curated picks without the clutter.
                </h2>
              </div>
              {popularCourses.slice(1, 4).map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-[#611f69]/50 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-[#c084fc]/50 sm:grid-cols-[120px_1fr]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg sm:aspect-auto">
                    <Image
                      src={course.image || COURSE_PLACEHOLDER_IMAGE}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#611f69] dark:text-[#c084fc]">
                      {course.category?.name}
                    </p>
                    <h3 className="mt-1 font-semibold">{course.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {truncate(course.description || "", 95)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
              Mentor spotlight
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Meet tutors through a cleaner spotlight view.
            </h2>
            <p className="mt-4 text-base leading-8 text-gray-600 dark:text-gray-300">
              Compare expertise, rate, courses, and reviews before starting a
              paid booking flow.
            </p>
            <Link
              href="/mentors"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#611f69] px-5 text-sm font-semibold text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black"
            >
              View all mentors
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            {featuredMentor && (
              <Link
                href={`/mentors/${featuredMentor.id}`}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <Image
                  src={getAvatarUrl(featuredMentor.user.image)}
                  alt={featuredMentor.user.name}
                  width={88}
                  height={88}
                  className="h-22 w-22 rounded-2xl object-cover"
                />
                <h3 className="mt-5 text-2xl font-bold">
                  {featuredMentor.user.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {truncate(featuredMentor.bio, 170)}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {featuredMentor.subjects.slice(0, 3).map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full bg-[#611f69]/10 px-2.5 py-1 text-xs font-medium text-[#611f69] dark:bg-[#c084fc]/15 dark:text-[#c084fc]"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </Link>
            )}
            <div className="space-y-3">
              {compactMentors.map((mentor) => (
                <Link
                  key={mentor.id}
                  href={`/mentors/${mentor.id}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <Image
                    src={getAvatarUrl(mentor.user.image)}
                    alt={mentor.user.name}
                    width={52}
                    height={52}
                    className="h-13 w-13 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{mentor.user.name}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {mentor.subjects.slice(0, 2).join(", ")}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#611f69] dark:text-[#c084fc]">
                      ৳ {mentor.price}/hr
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-14 dark:bg-gray-900/45 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-4">
            {[
              {
                icon: CreditCard,
                title: "Pay before confirmation",
                text: "Tutors confirm sessions only after payment is completed.",
              },
              {
                icon: ShieldCheck,
                title: "Role-based dashboards",
                text: "Students, tutors, and admins each get focused controls.",
              },
              {
                icon: Heart,
                title: "Wishlist shortcuts",
                text: "Students can save favorite courses and tutors.",
              },
              {
                icon: MessageSquare,
                title: "Smart notifications",
                text: "Booking, review, course, and system updates stay visible.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl bg-white p-5 dark:bg-gray-950">
                <Icon className="h-7 w-7 text-[#611f69] dark:text-[#c084fc]" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative min-h-72">
            <Image
              src={CERTIFICATE_IMAGE}
              alt="Certificate and learning records"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 460px"
            />
          </div>
          <div className="p-6 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
              After the session
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Learning records that students can keep.
            </h2>
            <p className="mt-4 text-base leading-8 text-gray-600 dark:text-gray-300">
              Paid sessions connect to invoices, payment history, reviews, and
              certificates. Students can view, print, and download the records
              they need.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Auto-generated invoices",
                "Certificate view and download",
                "Review after completion",
                "Payment history for every role",
              ].map((item) => (
                <p
                  key={item}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-14 dark:bg-gray-900/45 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
                Learning guides
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Read practical notes from SkillBridge.
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center text-sm font-semibold text-[#611f69] dark:text-[#c084fc]"
            >
              Visit blog
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.id}`}
                className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
              >
                <p className="text-xs font-medium text-[#611f69] dark:text-[#c084fc]">
                  {blog.tags.slice(0, 2).join(" / ") || "Guide"}
                </p>
                <h3 className="mt-3 line-clamp-2 text-lg font-semibold">
                  {blog.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {blog.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
              Student feedback
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Reviews tied to real completed sessions.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((review) => (
              <blockquote
                key={review.id}
                className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
              >
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 line-clamp-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {review.comment}
                </p>
                <p className="mt-4 text-xs font-semibold text-gray-500">
                  SkillBridge student
                </p>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-14 dark:bg-gray-900/45 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Questions learners usually ask.
            </h2>
          </div>
          <div className="space-y-3">
            {[
              [
                "Do students pay before booking?",
                "Yes. Payment happens before the booking is created and sent for tutor confirmation.",
              ],
              [
                "Can tutors confirm unpaid sessions?",
                "No. The dashboard checks payment status before allowing confirmation.",
              ],
              [
                "Can a confirmed session be cancelled?",
                "Students can cancel pending bookings. Confirmed-session cancellation is reserved for admins.",
              ],
              [
                "When can sessions be completed?",
                "Tutors and admins can mark sessions complete only after the scheduled date and time have passed.",
              ],
              [
                "Can I save courses or tutors?",
                "Students can wishlist both courses and tutors for quick access later.",
              ],
              [
                "Where are invoices and certificates?",
                "Students can view, print, and download invoices from payment history and certificates from the certificate dashboard.",
              ],
            ].map(([question, answer]) => (
              <details
                key={question}
                className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
              >
                <summary className="cursor-pointer font-semibold">
                  {question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-2xl bg-[#611f69] p-6 text-white dark:bg-[#c084fc] dark:text-black md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide opacity-80">
              Ready to learn?
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Book your next focused learning session with SkillBridge.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/mentors"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[#611f69] dark:bg-black dark:text-white"
            >
              Browse mentors
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/35 px-5 text-sm font-semibold"
            >
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
