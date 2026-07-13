"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Course } from "@/types/routes.type";
import { CourseCard } from "./CourseCard";
import { CourseGridSkeleton } from "./CourseCardSkeleton";

interface CourseGridProps {
  courses: Course[];
  loading?: boolean;
  emptyMessage?: string;
  skeletonCount?: number;
  /** Changes when filter tab changes — triggers grid transition */
  filterKey?: string;
}

export function CourseGrid({
  courses,
  loading = false,
  emptyMessage = "No courses in this category yet.",
  skeletonCount = 6,
  filterKey = "default",
}: CourseGridProps) {
  if (loading) {
    return (
      <div className="mt-10">
        <CourseGridSkeleton count={skeletonCount} />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <p className="mt-12 text-center text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={filterKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="grid auto-rows-fr items-stretch gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      >
        {courses.map((course, index) => (
          <CourseCard key={course.id} course={course} index={index} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
