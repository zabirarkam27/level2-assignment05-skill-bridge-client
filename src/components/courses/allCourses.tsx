"use client";

import { useEffect, useState } from "react";
import { Course } from "@/types/routes.type";
import { CourseGrid } from "./CourseGrid";
import { fetchPublicApi } from "@/lib/public-api";

interface AllCoursesProps {
  limit?: number;
  popularOnly?: boolean;
  emptyMessage?: string;
}

export default function AllCourses({
  limit,
  popularOnly = false,
  emptyMessage = "No courses available yet.",
}: AllCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const url = popularOnly
          ? "/courses/popular"
          : "/courses";

        const res = await fetchPublicApi(url);
        const data = await res.json();
        setCourses(Array.isArray(data.data) ? data.data : []);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [popularOnly]);

  const displayCourses = limit ? courses.slice(0, limit) : courses;

  return (
    <section className="bg-white p-6 transition-colors duration-300 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <CourseGrid
          courses={displayCourses}
          loading={loading}
          emptyMessage={emptyMessage}
          skeletonCount={limit ?? 6}
        />
      </div>
    </section>
  );
}
