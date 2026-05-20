"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CategoryTabs } from "@/components/courses/CategoryTabs";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { useCategoryCourses } from "@/hooks/useCategoryCourses";

export default function CategoryCoursesSection() {
  const router = useRouter();
  const {
    categories,
    courses,
    activeCategoryId,
    setActiveCategoryId,
    isInitialLoading,
    error,
  } = useCategoryCourses();

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const emptyMessage = activeCategory
    ? `No courses in ${activeCategory.name} yet.`
    : "No courses available yet.";

  return (
    <section className="bg-white px-4 py-20 transition-colors dark:bg-gray-900 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="mx-auto max-w-7xl"
      >
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Browse by Category
            </h2>
            <p className="mt-3 max-w-xl text-lg text-gray-600 dark:text-gray-300">
              Explore courses across every field — switch tabs to filter instantly.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/courses")}
            className="shrink-0 rounded-md border-2 border-[#611f69] px-6 py-2 font-medium text-[#611f69] transition-colors hover:bg-[#611f69] hover:text-white dark:border-[#c084fc] dark:text-[#e9d5ff] dark:hover:bg-[#c084fc] dark:hover:text-black"
          >
            View All Courses
          </button>
        </div>

        <div className="mt-10">
          <CategoryTabs
            categories={categories}
            activeId={activeCategoryId}
            onChange={setActiveCategoryId}
            loading={isInitialLoading}
          />
        </div>

        {error && !isInitialLoading && (
          <p className="mt-6 text-center text-sm text-red-500">{error}</p>
        )}

        <CourseGrid
          courses={courses}
          loading={isInitialLoading}
          emptyMessage={emptyMessage}
          filterKey={activeCategoryId}
        />
      </motion.div>
    </section>
  );
}
