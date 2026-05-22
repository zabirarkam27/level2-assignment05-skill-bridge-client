"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mentor, Review, AvailabilitySlot } from "@/types/routes.type";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Star,
  BookOpen,
  Clock,
  MessageSquare,
  User,
  CalendarDays,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAvatarUrl } from "@/lib/avatar";
import { useSessionContext } from "@/context/SessionContext";
import Link from "next/link";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const student = review.booking?.student;
  const studentName = student?.name ?? "Student";
  return (
    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-[#611f69]/10 flex items-center justify-center overflow-hidden">
          {student?.image ? (
            <Image src={student.image} alt={studentName} width={36} height={36} className="object-cover" />
          ) : (
            <span className="text-sm font-bold text-[#611f69]">{studentName[0]}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{studentName}</p>
          <StarRating rating={review.rating} />
        </div>
        <span className="ml-auto text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
    </div>
  );
}

export default function MentorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSessionContext();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [mentorRes, reviewsRes, availRes] = await Promise.allSettled([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/mentors/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/mentors/${id}/reviews`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/mentors/${id}/availability`),
        ]);

        if (mentorRes.status === "fulfilled") {
          const d = await mentorRes.value.json();
          setMentor(d.data || null);
        }
        if (reviewsRes.status === "fulfilled") {
          const d = await reviewsRes.value.json();
          setReviews(Array.isArray(d.data) ? d.data : []);
        }
        if (availRes.status === "fulfilled") {
          const d = await availRes.value.json();
          const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          setAvailability(
            (Array.isArray(d.data) ? d.data : []).map((s: any) => ({
              id: s.id,
              day: DAY_NAMES[s.dayOfWeek] ?? "Unknown",
              startTime: s.startTime,
              endTime: s.endTime,
              isBooked: false,
            }))
          );
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "—";
  const mentorCourses = mentor?.user.assignedCourses ?? mentor?.courses ?? [];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
        <div className="flex gap-6">
          <div className="w-32 h-32 rounded-2xl bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-3">
            <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-36 bg-gray-100 dark:bg-gray-600 rounded" />
            <div className="h-4 w-64 bg-gray-100 dark:bg-gray-600 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-24 text-gray-400">
        <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>Mentor not found.</p>
        <Link href="/mentors" className="mt-3 inline-block text-[#611f69] hover:underline text-sm">
          ← Back to mentors
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-[#611f69] dark:hover:text-[#c084fc] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-md mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-[#611f69]/20 flex-shrink-0 mx-auto sm:mx-0">
            <Image
              src={getAvatarUrl(mentor.user.image)}
              alt={mentor.user.name}
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mentor.user.name}
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {avgRating} ({reviews.length} reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-[#611f69] dark:text-[#c084fc]" />
                    {mentor.subjects.length} subjects
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#611f69] dark:text-[#c084fc]">
                  ৳ {mentor.price}
                  <span className="text-sm font-normal text-gray-400">/hr</span>
                </p>
              </div>
            </div>

            {/* Subjects */}
            <div className="flex flex-wrap gap-2 mt-3">
              {mentor.subjects.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full text-xs bg-[#611f69]/10 text-[#611f69] dark:bg-[#c084fc]/20 dark:text-[#e9d5ff] font-medium"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Bio */}
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {mentor.bio}
            </p>

            {/* CTA */}
            <div className="mt-5">
              {user ? (
                <Link
                  href={
                    mentorCourses.length === 1
                      ? `/book/${id}?courseId=${mentorCourses[0].id}`
                      : `/book/${id}`
                  }
                >
                  <Button className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]">
                    <CalendarDays className="w-4 h-4 mr-2" /> Book a Session
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black">
                    Login to Book
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <BookOpen className="h-4 w-4 text-[#611f69] dark:text-[#c084fc]" />
          Courses by {mentor.user.name}
        </h2>

        {mentorCourses.length === 0 ? (
          <p className="text-sm text-gray-400">
            No courses are assigned to this mentor yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {mentorCourses.map((course) => (
              <div
                key={course.id}
                className="rounded-xl border border-gray-100 p-4 transition-colors hover:border-[#611f69]/40 dark:border-gray-700"
              >
                <p className="text-xs font-medium text-[#611f69] dark:text-[#c084fc]">
                  {course.category?.name || "Course"}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    {course.description}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                    <Link href={`/courses/${course.id}`}>Details</Link>
                  </Button>
                  <Button
                    asChild={!!user}
                    size="sm"
                    disabled={!user}
                    className="h-8 bg-[#611f69] text-xs text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black"
                  >
                    {user ? (
                      <Link href={`/book/${id}?courseId=${course.id}`}>
                        Book This Course
                      </Link>
                    ) : (
                      "Login to Book"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Availability */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#611f69] dark:text-[#c084fc]" />
              Availability
            </h2>
            {availability.length === 0 ? (
              <p className="text-sm text-gray-400">Not set yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(
                  availability.reduce<Record<string, AvailabilitySlot[]>>((acc, s) => {
                    acc[s.day] = acc[s.day] ? [...acc[s.day], s] : [s];
                    return acc;
                  }, {}),
                ).map(([day, slots]) => (
                  <div key={day}>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {day}
                    </p>
                    {slots.map((sl) => (
                      <p key={sl.id} className="text-xs text-gray-600 dark:text-gray-300 ml-2">
                        {sl.startTime} – {sl.endTime}
                        {sl.isBooked && (
                          <span className="ml-1 text-red-400">(Booked)</span>
                        )}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#611f69] dark:text-[#c084fc]" />
              Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
