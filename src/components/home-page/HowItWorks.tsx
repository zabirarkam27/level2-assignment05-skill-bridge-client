"use client";

import { motion } from "framer-motion";
import { CalendarCheck, MessageSquareText, Search, UserCheck } from "lucide-react";

const steps = [
  {
    title: "Browse skilled tutors",
    description:
      "Search courses and mentors by category, expertise, and availability before choosing the right guide.",
    icon: Search,
  },
  {
    title: "Book a learning session",
    description:
      "Pick an available slot and confirm your session without online payment. Payment stays cash on delivery.",
    icon: CalendarCheck,
  },
  {
    title: "Learn with guidance",
    description:
      "Tutors manage sessions, update availability, and mark completed lessons from their dashboard.",
    icon: UserCheck,
  },
  {
    title: "Share your review",
    description:
      "After a completed booking, students can leave reviews that help future learners choose confidently.",
    icon: MessageSquareText,
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-gray-50 px-4 py-20 transition-colors dark:bg-gray-950 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mx-auto max-w-7xl"
      >
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            How MentorForge Works
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            A simple learning flow from discovery to verified feedback.
          </p>
        </div>

        <div className="mt-10 grid auto-rows-fr items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="flex h-full min-h-64 flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#611f69]/10 text-[#611f69] dark:bg-[#c084fc]/15 dark:text-[#e9d5ff]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 line-clamp-2 min-h-14 text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
