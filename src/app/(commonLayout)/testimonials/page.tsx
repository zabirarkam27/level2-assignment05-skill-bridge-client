"use client";

import { useEffect, useState } from "react";
import { Quote, Star, Users } from "lucide-react";
import { Review } from "@/types/routes.type";

export default function TestimonialsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reviews`,
          { cache: "no-store" },
        );
        const data = await res.json();
        setReviews(Array.isArray(data.data) ? data.data : []);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="min-h-[80vh] bg-white dark:bg-gray-950">
      <section className="border-b bg-gradient-to-b from-[#611f69]/5 to-transparent px-6 py-14 dark:from-[#c084fc]/10">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#611f69]/10 text-[#611f69] dark:bg-[#c084fc]/15 dark:text-[#c084fc]">
            <Users className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            Student Success Stories
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
            See how learners use MentorForge to connect with expert mentors,
            build confidence, and move faster toward their goals.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid auto-rows-fr items-stretch gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
              />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center text-gray-500 dark:border-gray-800 dark:text-gray-400">
            No reviews have been published yet.
          </div>
        ) : (
          <div className="grid auto-rows-fr items-stretch gap-5 md:grid-cols-2 lg:grid-cols-4">
            {reviews.map((item) => {
              const studentName = item.booking?.student?.name ?? "Student";
              const tutorName = item.booking?.tutor?.user?.name ?? "MentorForge tutor";

              return (
              <article
                key={item.id}
                className="flex h-full min-h-72 flex-col rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <Quote className="mb-4 h-7 w-7 text-[#611f69] dark:text-[#c084fc]" />
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: item.rating }).map((_, index) => (
                    <Star
                      key={index}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="line-clamp-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {item.comment}
                </p>
                <div className="mt-auto border-t border-gray-100 pt-4 dark:border-gray-800">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {studentName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Learned with {tutorName}
                  </p>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
