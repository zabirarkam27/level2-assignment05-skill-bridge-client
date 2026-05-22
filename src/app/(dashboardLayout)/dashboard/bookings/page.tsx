"use client";

import { useEffect, useState } from "react";
import { Booking, BookingStatus } from "@/types/routes.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

const statusVariant: Record<string, "default" | "success" | "destructive" | "warning"> = {
  PENDING: "default",
  CONFIRMED: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

const statusIcon: Record<string, React.ReactNode> = {
  PENDING: <Clock className="w-3.5 h-3.5" />,
  CONFIRMED: <Clock className="w-3.5 h-3.5" />,
  COMPLETED: <CheckCircle2 className="w-3.5 h-3.5" />,
  CANCELLED: <XCircle className="w-3.5 h-3.5" />,
};

function BookingCard({
  booking,
  index,
  onCancel,
}: {
  booking: Booking;
  index: number;
  onCancel: (id: string) => Promise<void>;
}) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    await onCancel(booking.id);
    setCancelling(false);
  };

  const canCancel = booking.status === "CONFIRMED" || booking.status === "PENDING";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            {booking.tutor?.user.name || "Tutor"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {booking.course?.title ?? "Tutoring Session"}
          </p>
          {booking.course?.category?.name && (
            <p className="mt-1 text-[11px] font-medium text-[#611f69] dark:text-[#c084fc]">
              {booking.course.category.name}
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {new Date(booking.dateTime).toLocaleDateString("en-BD", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(booking.dateTime).toLocaleTimeString("en-BD", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={statusVariant[booking.status]} className="flex items-center gap-1">
            {statusIcon[booking.status]}
            {booking.status}
          </Badge>
          {booking.status === "COMPLETED" && (
            <Link
              href="/dashboard/reviews"
              className="text-xs text-[#611f69] dark:text-[#c084fc] hover:underline"
            >
              Leave Review
            </Link>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="destructive"
              disabled={cancelling}
              onClick={handleCancel}
              className="h-7 px-3 text-xs"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              {cancelling ? "Cancelling…" : "Cancel"}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-24 bg-gray-100 dark:bg-gray-600 rounded" />
          <div className="h-3 w-48 bg-gray-100 dark:bg-gray-600 rounded mt-3" />
        </div>
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  );
}

export default function StudentBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/bookings`,
          { credentials: "include" },
        );
        const data = await res.json();
        setBookings(Array.isArray(data.data) ? data.data : []);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const cancelBooking = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CANCELLED" }),
        },
      );
      if (!res.ok) throw new Error();
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b)),
      );
      toast.success("Booking cancelled.");
    } catch {
      toast.error("Failed to cancel booking.");
    }
  };

  const filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#611f69] dark:text-[#c084fc]" />
          My Bookings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View and manage all your tutoring sessions
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["ALL", "CONFIRMED", "COMPLETED", "CANCELLED", "PENDING"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s
                ? "bg-[#611f69] text-white dark:bg-[#c084fc] dark:text-black"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No bookings found.</p>
          <Link
            href="/mentors"
            className="mt-3 inline-block text-sm text-[#611f69] dark:text-[#c084fc] hover:underline"
          >
            Browse mentors →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b, i) => (
            <BookingCard key={b.id} booking={b} index={i} onCancel={cancelBooking} />
          ))}
        </div>
      )}
    </div>
  );
}
