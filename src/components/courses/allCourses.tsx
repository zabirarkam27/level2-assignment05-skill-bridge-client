"use client";

import { useEffect, useState } from "react";
import { Course } from "@/types/routes.type";
import { CourseGrid } from "./CourseGrid";

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
          ? `${process.env.NEXT_PUBLIC_API_URL}/courses/popular`
          : `${process.env.NEXT_PUBLIC_API_URL}/courses`;

        const res = await fetch(url);
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
    <section className="bg-white px-6 transition-colors duration-300 dark:bg-gray-900">
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
