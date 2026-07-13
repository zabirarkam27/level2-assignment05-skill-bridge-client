"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDE_INTERVAL = 7000;

const slides = [
  {
    eyebrow: "Payment-first tutor booking platform",
    title: "Learn with the right mentor, at the right time.",
    description:
      "SkillBridge helps students discover trusted tutors, choose practical courses, pay before confirmation, and keep every session record organized in one dashboard.",
    primaryLabel: "Find a mentor",
    primaryHref: "/mentors",
    secondaryLabel: "Explore courses",
    secondaryHref: "/courses",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=85",
    imageAlt: "Student learning with an online mentor",
    icon: GraduationCap,
    highlight: "Booking flow",
    tags: ["Select Tutor", "Choose Course", "Pick Slot", "Pay Securely", "Tutor Confirms"],
  },
  {
    eyebrow: "Secure payment before booking",
    title: "Pay first, then create a clean booking record.",
    description:
      "Students complete Stripe payment before the booking is sent to the tutor. Admins and tutors can verify payment status from the dashboard.",
    primaryLabel: "Browse courses",
    primaryHref: "/courses",
    secondaryLabel: "How booking works",
    secondaryHref: "/about",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=85",
    imageAlt: "Secure online payment and learning records",
    icon: CreditCard,
    highlight: "Payment records",
    tags: ["Stripe Checkout", "Invoice", "Payment History", "Admin Verify"],
  },
  {
    eyebrow: "Tutor sessions with reminders",
    title: "Manage sessions without losing track of time.",
    description:
      "Confirmed sessions can include meeting links, calendar support, dashboard notifications, and clear completion rules after the session time passes.",
    primaryLabel: "Meet mentors",
    primaryHref: "/mentors",
    secondaryLabel: "View dashboard",
    secondaryHref: "/dashboard",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=85",
    imageAlt: "Online session planning with a mentor",
    icon: CalendarCheck,
    highlight: "Session tools",
    tags: ["Calendar", "Meet Link", "Reminder", "Completion"],
  },
  {
    eyebrow: "Learning records that stay organized",
    title: "Invoices, certificates, reviews, and wishlists in one place.",
    description:
      "Students can save courses and tutors, download invoices, view certificates, and leave reviews after completed sessions.",
    primaryLabel: "Start learning",
    primaryHref: "/sign-up",
    secondaryLabel: "Read reviews",
    secondaryHref: "/testimonials",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=85",
    imageAlt: "Learning certificates and student records",
    icon: ShieldCheck,
    highlight: "Student dashboard",
    tags: ["Wishlist", "Certificate", "Review", "Notifications"],
  },
];

export default function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  }, []);

  const goToNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(goToNext, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [goToNext]);

  const slide = slides[activeIndex];
  const Icon = slide.icon;

  return (
    <section className="overflow-hidden border-b border-gray-200 bg-[radial-gradient(circle_at_top_left,rgba(97,31,105,0.16),transparent_34%),linear-gradient(180deg,rgba(97,31,105,0.06),transparent)] dark:border-gray-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(192,132,252,0.18),transparent_34%),linear-gradient(180deg,rgba(192,132,252,0.08),transparent)]">
      <div className="mx-auto grid min-h-[620px] max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#611f69]/20 bg-white px-3 py-1 text-xs font-semibold text-[#611f69] shadow-sm dark:border-[#c084fc]/30 dark:bg-gray-900 dark:text-[#c084fc]">
                <Icon className="h-3.5 w-3.5" />
                {slide.eyebrow}
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                {slide.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-300 md:text-lg">
                {slide.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={slide.primaryHref}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-[#611f69] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]"
                >
                  {slide.primaryLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href={slide.secondaryHref}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 transition-colors hover:border-[#611f69] hover:text-[#611f69] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-[#c084fc] dark:hover:text-[#c084fc]"
                >
                  {slide.secondaryLabel}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => goToSlide(activeIndex - 1)}
              aria-label="Previous hero slide"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-[#611f69] hover:text-[#611f69] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-[#c084fc] dark:hover:text-[#c084fc]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2" aria-label="Hero slides">
              {slides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  className={cn(
                    "h-2.5 rounded-full transition-all",
                    activeIndex === index
                      ? "w-9 bg-[#611f69] dark:bg-[#c084fc]"
                      : "w-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next hero slide"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-[#611f69] hover:text-[#611f69] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-[#c084fc] dark:hover:text-[#c084fc]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.image}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  priority={activeIndex === 0}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/92 p-4 text-gray-900 shadow-lg backdrop-blur dark:bg-gray-950/90 dark:text-white">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#611f69] dark:text-[#c084fc]">
                  {slide.highlight}
                </p>
                <BookOpen className="h-4 w-4 text-[#611f69] dark:text-[#c084fc]" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {slide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium dark:bg-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
