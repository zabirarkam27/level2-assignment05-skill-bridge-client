"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { Mentor, AvailabilitySlot, Course } from "@/types/routes.type";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import { CalendarDays, Clock, ArrowLeft, BookOpen, Info } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";
import { useSessionContext } from "@/context/SessionContext";
import { motion } from "framer-motion";

export default function BookPage() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCourseId = searchParams.get("courseId") || "";
  const { user } = useSessionContext();

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [date, setDate] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(requestedCourseId);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [mRes, aRes] = await Promise.allSettled([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/mentors/${tutorId}`, {
            signal: controller.signal,
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/mentors/${tutorId}/availability`,
            { signal: controller.signal },
          ),
        ]);

        if (!isMounted) return;

        if (mRes.status === "fulfilled") {
          const d = await mRes.value.json();
          if (isMounted) {
            const mentorData = d.data || null;
            const assignedCourses = mentorData?.user?.assignedCourses ?? mentorData?.courses ?? [];
            setMentor(mentorData);
            setCourses(assignedCourses);
            setSelectedCourseId((current) =>
              current || (assignedCourses.length === 1 ? assignedCourses[0].id : ""),
            );
          }
        }
        if (aRes.status === "fulfilled") {
          const d = await aRes.value.json();
          if (isMounted) {
            const DAY_NAMES = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ];
            setAvailability(
              (Array.isArray(d.data) ? d.data : []).map((s: any) => ({
                id: s.id,
                dayOfWeek: s.dayOfWeek,
                day: DAY_NAMES[s.dayOfWeek] ?? "Unknown",
                startTime: s.startTime,
                endTime: s.endTime,
                isBooked: false,
              })),
            );
          }
        }
      } catch {
        if (isMounted) {
          // Handle errors silently for now
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [tutorId, user, router]);

  const dateMatchesSlot = (dateStr: string, dayOfWeek: number) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).getDay() === dayOfWeek;
  };

  const selectedCourse = courses.find((course) => course.id === selectedCourseId);

  const handleBook = async () => {
    if (courses.length === 0) {
      toast.info("This mentor does not have an assigned course available for booking yet.");
      return;
    }

    if (availability.length === 0) {
      toast.info(
        "This mentor is currently unavailable for booking. Please check back later.",
      );
      return;
    }

    if (!selectedCourseId) {
      toast.error("Please select the course you want to book for");
      return;
    }

    if (!selectedSlot || !date) {
      toast.error("Please select an availability slot and date");
      return;
    }
    if (!dateMatchesSlot(date, selectedSlot.dayOfWeek)) {
      toast.error(
        `Please pick a ${selectedSlot.day} for this time slot`,
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/initiate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId,
          courseId: selectedCourseId,
          availabilityId: selectedSlot.id,
          date,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      const data = await res.json();
      const paymentUrl = data?.data?.paymentUrl;
      if (!paymentUrl) {
        throw new Error("Payment gateway URL was not returned");
      }
      toast.success("Redirecting to secure payment...");
      window.location.href = paymentUrl;
    } catch (err: any) {
      toast.error(err.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#611f69] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-24 text-gray-400">
        <p>Tutor not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-[#611f69] dark:hover:text-[#c084fc] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-[#611f69] dark:text-[#c084fc]" />
        Book a Session
      </h1>

      {/* Tutor info */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 mb-6 flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-[#611f69]/20 shrink-0">
          <Image
            src={getAvatarUrl(mentor.user.image)}
            alt={mentor.user.name}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {mentor.user.name}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {mentor.subjects.slice(0, 3).join(", ")}
          </p>
          <p className="text-sm font-semibold text-[#611f69] dark:text-[#c084fc] mt-1">
            ৳ {mentor.price}/hr
          </p>
          {selectedCourse && (
            <p className="mt-1 text-xs text-gray-500">
              Booking for:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {selectedCourse.title}
              </span>
            </p>
          )}
        </div>
      </motion.div>

      {/* Booking form */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Course *
          </label>
          {courses.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
              No course is assigned to this mentor yet. Booking will be available
              once an admin or mentor assigns a course.
            </div>
          ) : (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              title="Select course for this session"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#611f69]/40 dark:focus:ring-[#c084fc]/40"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Availability slots */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#611f69] dark:text-[#c084fc]" />
            Select Time Slot
          </label>
          {availability.length === 0 ? (
            <div className="rounded-xl border border-[#611f69]/15 bg-[#611f69]/5 p-4 text-sm text-gray-600 dark:border-[#c084fc]/20 dark:bg-[#c084fc]/10 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#611f69] dark:text-[#c084fc]" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    This mentor is currently unavailable for booking.
                  </p>
                  <p className="mt-1 leading-6">
                    We sincerely apologize for the inconvenience. At the
                    moment, no session slots have been published by this tutor.
                    Our team is coordinating with the mentor to update their
                    availability as soon as possible.
                  </p>
                  <p className="mt-2 leading-6">
                    Please check back later. New booking schedules will appear
                    once they become available.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availability.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`text-left px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                    selectedSlot?.id === slot.id
                      ? "border-[#611f69] bg-[#611f69]/10 text-[#611f69] dark:border-[#c084fc] dark:bg-[#c084fc]/10 dark:text-[#e9d5ff]"
                      : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#611f69]/50"
                  }`}
                >
                  <p className="font-semibold">{slot.day}</p>
                  <p>
                    {slot.startTime} – {slot.endTime}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-[#611f69] dark:text-[#c084fc]" />
            Preferred Date
          </label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            title="Preferred Date"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#611f69]/40 dark:focus:ring-[#c084fc]/40"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Note (optional)
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any specific topics you want to cover..."
            rows={3}
          />
        </div>

        <Button
          onClick={handleBook}
          disabled={
            submitting ||
            courses.length === 0 ||
            availability.length === 0 ||
            !selectedCourseId ||
            !selectedSlot ||
            !date
          }
          className="w-full bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe] py-5 text-base"
        >
          {courses.length === 0 || availability.length === 0
            ? "Booking Unavailable"
            : submitting
              ? "Preparing Payment..."
              : "Pay & Request Booking"}
        </Button>
      </motion.div>
    </div>
  );
}
