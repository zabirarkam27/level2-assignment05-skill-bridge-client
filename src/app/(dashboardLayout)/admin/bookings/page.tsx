"use client";

import { useEffect, useState } from "react";
import { Booking, BookingStatus } from "@/types/routes.type";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Video } from "lucide-react";
import { motion } from "framer-motion";

const statusVariant: Record<
  BookingStatus,
  "default" | "warning" | "success" | "destructive"
> = {
  PENDING: "default",
  CONFIRMED: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

const isPaymentPaid = (booking: Booking) => booking.payment?.status === "PAID";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");

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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#611f69]/40 w-52"
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
              const paymentPaid = isPaymentPaid(booking);

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
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
                  <Badge variant={statusVariant[booking.status]}>
                    {booking.status}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
