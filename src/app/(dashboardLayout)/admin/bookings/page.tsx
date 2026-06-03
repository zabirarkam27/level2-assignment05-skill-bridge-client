"use client";

import { useEffect, useState } from "react";
import { Booking, BookingStatus } from "@/types/routes.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, CheckCircle2, Search, Video, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  canAdminCancelBooking,
  canCompleteBooking,
  canConfirmBooking,
  hasSessionStarted,
  isBookingPaymentPaid,
} from "@/lib/booking-rules";

const statusVariant: Record<
  BookingStatus,
  "default" | "warning" | "success" | "destructive"
> = {
  PENDING: "default",
  CONFIRMED: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`,
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

  const filtered = bookings
    .filter((b) => filter === "ALL" || b.status === filter)
    .filter((b) => {
      const q = search.toLowerCase();
      return (
        b.tutor?.user.name?.toLowerCase().includes(q) ||
        b.student?.name?.toLowerCase().includes(q) ||
        b.course?.title?.toLowerCase().includes(q) ||
        b.course?.category?.name?.toLowerCase().includes(q)
      );
    });

  const updateStatus = async (
    booking: Booking,
    status: "CONFIRMED" | "COMPLETED" | "CANCELLED",
  ) => {
    setActionId(`${booking.id}-${status}`);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/${booking.id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update booking.");
      }

      const responseData = await res.json().catch(() => ({}));
      const updatedBooking = responseData.data as Booking | undefined;

      setBookings((prev) =>
        prev.map((item) =>
          item.id === booking.id
            ? { ...item, ...(updatedBooking ?? {}), status }
            : item,
        ),
      );

      toast.success(`Booking marked as ${status.toLowerCase()}.`);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update booking.",
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#611f69] dark:text-[#c084fc]" />
            All Bookings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {bookings.length} total bookings
          </p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#611f69]/40 sm:w-52"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s
                ? "bg-[#611f69] text-white dark:bg-[#c084fc] dark:text-black"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 flex gap-4 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-32 bg-gray-100 dark:bg-gray-600 rounded" />
                </div>
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No bookings found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map((booking, i) => {
              const paymentPaid = isBookingPaymentPaid(booking);
              const confirmAllowed = canConfirmBooking(booking);
              const completeAllowed = canCompleteBooking(booking);
              const cancelAllowed = canAdminCancelBooking(booking);
              const confirmTitle = !paymentPaid
                ? "Payment must be completed before confirmation"
                : hasSessionStarted(booking)
                  ? "Past sessions cannot be confirmed"
                  : "Confirm this paid booking";

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 sm:flex-row sm:items-center sm:px-5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {booking.student?.name || "Student"}{" "}
                      <span className="font-normal text-gray-400">to</span>{" "}
                      {booking.tutor?.user.name || "Tutor"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {booking.course?.title || "Course not assigned"}
                      {booking.course?.category?.name
                        ? ` - ${booking.course.category.name}`
                        : ""}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(booking.dateTime).toLocaleDateString()} -{" "}
                      {new Date(booking.dateTime).toLocaleTimeString("en-BD", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {booking.status === "PENDING" && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant={paymentPaid ? "success" : "destructive"}>
                          {paymentPaid ? "Payment verified" : "Payment pending"}
                        </Badge>
                        {booking.payment?.transactionId && (
                          <span className="text-[11px] text-gray-400">
                            TXN: {booking.payment.transactionId}
                          </span>
                        )}
                      </div>
                    )}
                    {booking.status === "CONFIRMED" && booking.meetingLink && (
                      <a
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join Google Meet
                      </a>
                    )}
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-col sm:items-end">
                    <Badge className="self-start sm:self-center" variant={statusVariant[booking.status]}>
                      {booking.status}
                    </Badge>
                    {booking.status === "PENDING" && (
                      <Button
                        size="sm"
                        disabled={actionId !== null || !confirmAllowed}
                        title={confirmTitle}
                        onClick={() => updateStatus(booking, "CONFIRMED")}
                        className="h-7 px-3 text-xs bg-[#611f69] text-white hover:bg-[#4a174f] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#c084fc] dark:text-black"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        {actionId === `${booking.id}-CONFIRMED` ? "..." : "Confirm"}
                      </Button>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        disabled={actionId !== null || !completeAllowed}
                        title={
                          completeAllowed
                            ? "Mark this finished session as completed"
                            : "Session can be completed after its scheduled time"
                        }
                        onClick={() => updateStatus(booking, "COMPLETED")}
                        className="h-7 px-3 text-xs bg-green-600 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        {actionId === `${booking.id}-COMPLETED` ? "..." : "Complete"}
                      </Button>
                    )}
                    {cancelAllowed && (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionId !== null}
                        title="Admins can cancel pending or confirmed bookings"
                        onClick={() => updateStatus(booking, "CANCELLED")}
                        className="h-7 px-3 text-xs"
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        {actionId === `${booking.id}-CANCELLED` ? "..." : "Cancel"}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
