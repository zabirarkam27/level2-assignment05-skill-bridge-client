"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { Mentor, Category } from "@/types/routes.type";
import { Star, BookOpen, Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAvatarUrl } from "@/lib/avatar";
import { fetchPublicApi } from "@/lib/public-api";
import WishlistToggle from "@/components/wishlist/WishlistToggle";

// MentorCard

interface MentorCardProps {
  tutor: Mentor;
  index: number;
  subjectLimit?: number;
}

export function MentorCard({ tutor, index, subjectLimit = 3 }: MentorCardProps) {
  const rating = tutor.rating ?? 0;
  const visibleSubjects = tutor.subjects.slice(0, subjectLimit);
  const hiddenSubjectCount = Math.max(tutor.subjects.length - subjectLimit, 0);

  return (
    <Link href={`/mentors/${tutor.id}`} className="group block h-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        className="relative flex h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
      >
        {/* top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#7b2a85] via-[#611f69] to-[#a855f7]" />
        <WishlistToggle
          type="tutor"
          id={tutor.id}
          count={tutor._count?.wishlists ?? 0}
          className="absolute right-3 top-4 z-10"
        />

        <div className="flex grow flex-col items-center p-6 text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full ring-4 ring-[#611f69]/30 group-hover:ring-[#611f69] transition-all duration-300 overflow-hidden">
              <Image
                src={getAvatarUrl(tutor.user.image)}
                alt={tutor.user.name}
                width={96}
                height={96}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full" />
          </div>

          {/* Name */}
          <h3 className="line-clamp-2 min-h-[3rem] text-lg font-bold leading-6 text-gray-900 dark:text-white">
            {tutor.user.name}
          </h3>

          {/* Subjects */}
          <div className="mt-2 flex h-[3.75rem] flex-wrap content-start justify-center gap-1 overflow-hidden">
            {visibleSubjects.map((subject) => (
              <span
                key={subject}
                className="text-xs px-2 py-0.5 rounded-full bg-[#611f69]/10 text-[#611f69] dark:bg-[#c084fc]/20 dark:text-[#e9d5ff] font-medium"
              >
                {subject}
              </span>
            ))}
            {hiddenSubjectCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                +{hiddenSubjectCount} more
              </span>
            )}
          </div>

          {/* Bio */}
          <p className="mt-3 line-clamp-2 h-[2.75rem] text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {tutor.bio || "Passionate educator helping students excel."}
          </p>

          {/* Stats row */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              {rating > 0 ? rating.toFixed(1) : "New"}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#611f69] dark:text-[#c084fc]" />
              {tutor.subjects.length} subjects
            </span>
          </div>

          {/* Price + CTA */}
          <div className="mt-auto flex w-full items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Rate</p>
              <p className="text-base font-bold text-[#611f69] dark:text-[#c084fc]">
                ৳ {tutor.price}
                <span className="text-xs font-normal text-gray-400">/hr</span>
              </p>
            </div>
            <button className="px-4 py-1.5 rounded-lg bg-[#611f69] text-white text-sm font-medium hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe] transition-colors duration-200 cursor-pointer">
              Book Now
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// Skeleton

function MentorSkeleton() {
  return (
    <div className="h-[420px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 animate-pulse">
      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700" />
      <div className="p-6 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 w-48 bg-gray-100 dark:bg-gray-600 rounded mb-3" />
        <div className="h-3 w-full bg-gray-100 dark:bg-gray-600 rounded mb-1" />
        <div className="h-3 w-4/5 bg-gray-100 dark:bg-gray-600 rounded" />
      </div>
    </div>
  );
}

// AllMentors

interface AllMentorsProps {
  limit?: number;
}

export default function AllMentors({ limit }: AllMentorsProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // filter state
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const displayMentors = limit ? mentors.slice(0, limit) : mentors;
  const showFilterUI = !limit;
  const subjectLimit = limit ? 2 : 3;

  const fetchMentors = useCallback(
    async (params?: {
      search?: string;
      minPrice?: string;
      maxPrice?: string;
      minRating?: string;
      categoryId?: string;
    }) => {
      setLoading(true);
      setError(false);
      try {
        const query = new URLSearchParams();
        if (params?.search) query.set("search", params.search);
        if (params?.minPrice) query.set("minPrice", params.minPrice);
        if (params?.maxPrice) query.set("maxPrice", params.maxPrice);
        if (params?.minRating) query.set("minRating", params.minRating);
        if (params?.categoryId) query.set("categoryId", params.categoryId);
        const qs = query.toString();
        const res = await fetchPublicApi(`/mentors${qs ? `?${qs}` : ""}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setMentors(Array.isArray(data.data) ? data.data : []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  useEffect(() => {
    if (!showFilterUI) return;
    fetchPublicApi("/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d.data) ? d.data : []))
      .catch(() => {});
  }, [showFilterUI]);

  const applyFilters = () => {
    fetchMentors({ search, minPrice, maxPrice, minRating, categoryId });
  };

  const clearFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setCategoryId("");
    fetchMentors();
  };

  const hasActiveFilters =
    search || minPrice || maxPrice || minRating || categoryId;

  return (
    <section className="bg-white dark:bg-gray-900 px-6 transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        {/* Search & Filter bar — only on full listing page */}
        {showFilterUI && (
          <div className="mt-8 space-y-3">
            {/* Search row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  placeholder="Search by name, subject, or bio…"
                  className="pl-9"
                />
              </div>
              <Button
                onClick={applyFilters}
                className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black"
              >
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters((v) => !v)}
                className="gap-1"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="gap-1 text-gray-500"
                >
                  <X className="w-4 h-4" /> Clear
                </Button>
              )}
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Min Price (৳)
                  </label>
                  <Input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Max Price (৳)
                  </label>
                  <Input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Any"
                    min={0}
                  />
                </div>
                <div>
                  <label
                    htmlFor="min-rating"
                    className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                  >
                    Min Rating
                  </label>
                  <select
                    id="min-rating"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#611f69]/40"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r}+ stars
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="category"
                    className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#611f69]/40"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="mt-10 grid auto-rows-fr items-stretch gap-6 py-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: limit || 6 }).map((_, i) => (
              <MentorSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="mt-10 text-center py-20 text-gray-500 dark:text-gray-400">
            <p className="text-lg">Failed to load mentors. Please try again.</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && displayMentors.length === 0 && (
          <div className="mt-10 text-center py-20 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No mentors found.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && displayMentors.length > 0 && (
          <div className="mt-10 grid auto-rows-fr items-stretch gap-6 py-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {displayMentors.map((tutor, i) => (
              <MentorCard
                key={tutor.id}
                tutor={tutor}
                index={i}
                subjectLimit={subjectLimit}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
