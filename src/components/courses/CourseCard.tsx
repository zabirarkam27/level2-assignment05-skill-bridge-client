"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Course } from "@/types/routes.type";

export const COURSE_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";

interface CourseCardProps {
  course: Course;
  index?: number;
}

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const instructorName =
    course.tutor?.name ||
    (course.createdBy.role === "ADMIN"
      ? "Instructor not assigned"
      : course.createdBy.name);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
    >
      <Link href={`/courses/${course.id}`} className="flex grow flex-col">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={course.image || COURSE_PLACEHOLDER_IMAGE}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <motion.div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
          {course.isPopular && (
            <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[#611f69] px-2.5 py-1 text-xs font-medium text-white dark:bg-[#c084fc] dark:text-black">
              <Star className="h-3 w-3 fill-current" />
              Popular
            </span>
          )}
        </div>

        <div className="flex grow flex-col p-6">
          <span className="mb-2 inline-block w-fit rounded-full bg-[#611f69]/10 px-2.5 py-0.5 text-xs font-medium text-[#611f69] dark:bg-[#c084fc]/20 dark:text-[#c084fc]">
            {course.category.name}
          </span>
          <h3 className="text-xl font-semibold text-gray-800 transition-colors group-hover:text-[#611f69] dark:text-white dark:group-hover:text-[#c084fc]">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
            {course.description || "No description available"}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <p className="text-xs text-gray-400">
              By {instructorName}
              {course.tutor ? " - Tutor" : ""}
            </p>
            <span className="flex items-center gap-1 text-xs font-semibold text-[#611f69] dark:text-[#c084fc]">
              Details
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
