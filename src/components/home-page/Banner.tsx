"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomeBanner() {
  return (
    <section className="relative overflow-hidden bg-[#fcf6ef] dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Soft Gradient Orbs */}
      <div className="absolute -top-32 -left-32 h-112 w-md rounded-full bg-pink-300/30 dark:bg-pink-600/20 blur-3xl transition-colors duration-300" />
      <div className="absolute top-1/3 -right-32 h-104 w-104 rounded-full bg-indigo-300/30 dark:bg-indigo-500/20 blur-3xl transition-colors duration-300" />
      <div className="absolute -bottom-32 left-1/3 h-104 w-104 rounded-full bg-amber-200/40 dark:bg-amber-400/20 blur-3xl transition-colors duration-300" />

      <div className="relative mx-auto max-w-7xl px-6 py-32 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center rounded-full bg-gray-900/5 dark:bg-gray-100/10 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 backdrop-blur transition-colors duration-300"
        >
          Your Learning Companion
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
        >
          Learn Smarter.{" "}
          <span className="block bg-linear-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            Grow Faster.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300 transition-colors duration-300"
        >
          Connect with expert tutors, master new skills, and shape your future
          with Skill Bridge.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="rounded-2xl bg-gray-900 dark:bg-gray-100 dark:text-gray-900 px-10 py-6 text-base text-white shadow-lg transition transform duration-200 hover:scale-105 hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            <Link href="/sign-up">Get Started</Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-2xl border-gray-400 dark:border-gray-300 px-10 py-6 text-base text-gray-700 dark:text-gray-300 transition transform duration-200 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-200 dark:hover:text-gray-900 hover:scale-105"
          >
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
