"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Category, Course } from "@/types/routes.type";
import { CourseGrid } from "./CourseGrid";
import { fetchPublicApi } from "@/lib/public-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [popularFilter, setPopularFilter] = useState("all");
  const [sort, setSort] = useState("createdAt-desc");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const categoryFromUrl = searchParams.get("categoryId");

    if (categoryFromUrl) {
      setCategoryId(categoryFromUrl);
      setPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPublicApi("/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data.data) ? data.data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [sortBy, sortOrder] = sort.split("-");
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit ?? 8),
          sortBy,
          sortOrder,
        });

        if (popularOnly || popularFilter === "popular") {
          params.set("popular", "true");
        }
        if (categoryId !== "all") params.set("categoryId", categoryId);
        if (search.trim()) params.set("search", search.trim());

        const res = await fetchPublicApi(`/courses?${params.toString()}`);
        const data = await res.json();
        setCourses(Array.isArray(data.data) ? data.data : []);
        if (data.meta) setMeta(data.meta);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    fetchCourses();
  }, [categoryId, limit, page, popularFilter, popularOnly, search, sort]);

  const displayCourses = limit ? courses.slice(0, limit) : courses;
  const filterKey = `${search}-${categoryId}-${popularFilter}-${sort}-${page}`;

  return (
    <section className="bg-white p-6 transition-colors duration-300 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        {!popularOnly && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search courses, categories, or tutors..."
              />
              <select
                aria-label="Filter by category"
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter popular courses"
                value={popularFilter}
                onChange={(event) => {
                  setPopularFilter(event.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All courses</option>
                <option value="popular">Popular only</option>
              </select>
              <select
                aria-label="Sort courses"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="createdAt-desc">Newest first</option>
                <option value="createdAt-asc">Oldest first</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="category-asc">Category A-Z</option>
                <option value="popular-desc">Popular first</option>
              </select>
            </div>
          </div>
        )}
        <CourseGrid
          courses={displayCourses}
          loading={loading}
          emptyMessage={emptyMessage}
          skeletonCount={limit ?? 6}
          filterKey={filterKey}
        />
        {!popularOnly && !loading && meta.totalPages > 1 && (
          <div className="mt-10 flex flex-col items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm dark:border-gray-800 sm:flex-row">
            <span className="text-gray-600 dark:text-gray-300">
              Page {meta.page} of {meta.totalPages} · {meta.total} courses
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= meta.totalPages}
                onClick={() =>
                  setPage((current) => Math.min(meta.totalPages, current + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
