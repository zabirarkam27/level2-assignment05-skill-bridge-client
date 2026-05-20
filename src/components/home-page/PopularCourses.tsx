"use client";

import { motion } from "framer-motion";
import AllCourses from "../courses/allCourses";
import { useRouter } from "next/navigation";

export default function PopularCourses() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="mx-auto max-w-7xl py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            Popular Courses
          </motion.h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            Explore our trending courses and start learning today
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-md border-2 border-[#611f69] px-6 py-2 font-medium text-[#611f69] transition-colors duration-200 hover:bg-[#611f69] hover:text-white dark:border-[#c084fc] dark:text-[#e9d5ff] dark:hover:bg-[#c084fc] dark:hover:text-black"
          onClick={() => router.push("/courses")}
        >
          Explore Courses
        </motion.button>
      </div>
      <AllCourses
        limit={6}
        popularOnly
        emptyMessage="No popular courses yet. Check back soon!"
      />
    </motion.div>
  );
}
