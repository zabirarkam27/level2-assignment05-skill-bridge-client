"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Category, Course } from "@/types/routes.type";
import { fetchPublicApi } from "@/lib/public-api";

export const ALL_CATEGORIES_TAB_ID = "all";

export function useCategoryCourses() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState(
    ALL_CATEGORIES_TAB_ID,
  );
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    setCategoriesLoading(true);
    setCoursesLoading(true);

    try {
      const [categoriesRes, coursesRes] = await Promise.all([
        fetchPublicApi("/categories"),
        fetchPublicApi("/courses"),
      ]);

      const categoriesJson = await categoriesRes.json();
      const coursesJson = await coursesRes.json();

      setCategories(
        categoriesRes.ok && Array.isArray(categoriesJson.data)
          ? categoriesJson.data
          : [],
      );
      setCourses(
        coursesRes.ok && Array.isArray(coursesJson.data)
          ? coursesJson.data
          : [],
      );

      if (!categoriesRes.ok || !coursesRes.ok) {
        setError("Failed to load courses. Please try again later.");
      }
    } catch {
      setCategories([]);
      setCourses([]);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setCategoriesLoading(false);
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCourses = useMemo(() => {
    if (activeCategoryId === ALL_CATEGORIES_TAB_ID) return courses;
    return courses.filter((c) => c.categoryId === activeCategoryId);
  }, [courses, activeCategoryId]);

  const isInitialLoading = categoriesLoading || coursesLoading;

  return {
    categories,
    courses: filteredCourses,
    activeCategoryId,
    setActiveCategoryId,
    isInitialLoading,
    error,
    refetch: fetchData,
  };
}
