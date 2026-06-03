"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Heart, Star, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Course, Mentor } from "@/types/routes.type";
import { COURSE_PLACEHOLDER_IMAGE } from "@/components/courses/CourseCard";
import { getAvatarUrl } from "@/lib/avatar";

type WishlistData = {
  courses: Course[];
  tutors: Mentor[];
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistData>({
    courses: [],
    tutors: [],
  });
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load wishlist");
      setWishlist({
        courses: Array.isArray(data.data?.courses) ? data.data.courses : [],
        tutors: Array.isArray(data.data?.tutors) ? data.data.tutors : [],
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeItem = async (type: "course" | "tutor", id: string) => {
    setRemoving(`${type}-${id}`);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wishlist/${type}/${id}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to remove item");

      setWishlist((prev) => ({
        courses:
          type === "course"
            ? prev.courses.filter((course) => course.id !== id)
            : prev.courses,
        tutors:
          type === "tutor"
            ? prev.tutors.filter((tutor) => tutor.id !== id)
            : prev.tutors,
      }));
      toast.success(type === "course" ? "Course removed" : "Tutor removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove item");
    } finally {
      setRemoving(null);
    }
  };

  const isEmpty = wishlist.courses.length === 0 && wishlist.tutors.length === 0;

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          Wishlist
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Save favorite courses and tutors for quick access.
        </p>
      </div>

      {loading ? (
        <div className="grid auto-rows-fr gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-xl border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-20 text-center dark:border-gray-700 dark:bg-gray-800">
          <Heart className="mx-auto mb-4 h-14 w-14 text-red-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            No saved items yet
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Save your favorite courses and tutors to access them quickly later.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/courses">Browse Courses</Link>
            </Button>
            <Button asChild className="bg-[#611f69] text-white hover:bg-[#4a174f]">
              <Link href="/mentors">Browse Tutors</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
              <BookOpen className="h-4 w-4 text-[#611f69] dark:text-[#c084fc]" />
              Saved Courses
            </h2>
            {wishlist.courses.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400 dark:border-gray-700">
                No saved courses.
              </p>
            ) : (
              <div className="grid auto-rows-fr items-stretch gap-4 md:grid-cols-2">
                {wishlist.courses.map((course) => (
                  <div
                    key={course.id}
                    className="h-full min-h-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex h-full gap-4 p-4">
                      <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={course.image || COURSE_PLACEHOLDER_IMAGE}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="text-xs font-medium text-[#611f69] dark:text-[#c084fc]">
                          {course.category?.name}
                        </p>
                        <Link
                          href={`/courses/${course.id}`}
                          className="mt-1 line-clamp-2 min-h-12 font-semibold text-gray-900 hover:text-[#611f69] dark:text-white dark:hover:text-[#c084fc]"
                        >
                          {course.title}
                        </Link>
                        <p className="mt-1 line-clamp-2 min-h-8 text-xs text-gray-500 dark:text-gray-400">
                          {course.description || "No description available"}
                        </p>
                        <p className="mt-auto pt-2 text-[11px] text-gray-400">
                          {course._count?.wishlists ?? 0} students saved this course
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={removing === `course-${course.id}`}
                        onClick={() => removeItem("course", course.id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
              <UserRound className="h-4 w-4 text-[#611f69] dark:text-[#c084fc]" />
              Saved Tutors
            </h2>
            {wishlist.tutors.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400 dark:border-gray-700">
                No saved tutors.
              </p>
            ) : (
              <div className="grid auto-rows-fr items-stretch gap-4 md:grid-cols-2">
                {wishlist.tutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="h-full min-h-36 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex h-full items-start gap-4">
                      <Image
                        src={getAvatarUrl(tutor.user.image)}
                        alt={tutor.user.name}
                        width={58}
                        height={58}
                        className="rounded-full object-cover"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link
                          href={`/mentors/${tutor.id}`}
                          className="line-clamp-2 min-h-12 font-semibold text-gray-900 hover:text-[#611f69] dark:text-white dark:hover:text-[#c084fc]"
                        >
                          {tutor.user.name}
                        </Link>
                        <p className="mt-1 line-clamp-1 min-h-4 text-xs text-gray-500 dark:text-gray-400">
                          {tutor.subjects.slice(0, 3).join(", ")}
                        </p>
                        <div className="mt-auto flex flex-wrap gap-3 pt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            {tutor.rating ? tutor.rating.toFixed(1) : "New"}
                          </span>
                          <span>
                            {tutor._count?.wishlists ?? 0} students saved this tutor
                          </span>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={removing === `tutor-${tutor.id}`}
                        onClick={() => removeItem("tutor", tutor.id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
