"use client";

import { useEffect, useState } from "react";
import { Booking, BookingStatus } from "@/types/routes.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CalendarDays, Clock, CheckCircle2, Check, BookOpen, Video } from "lucide-react";
import { motion } from "framer-motion";

const statusVariant: Record<BookingStatus, "default" | "warning" | "success" | "destructive"> = {
  PENDING: "default",
  CONFIRMED: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

const isPaymentPaid = (booking: Booking) => booking.payment?.status === "PAID";

export default function TutorSessionsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"sessions" | "courses">("sessions");

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

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: string, status: "CONFIRMED" | "COMPLETED") => {
    setActionId(id);
    try {
      const endpoint =
        status === "COMPLETED"
          ? `${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}/complete`
          : `${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}/status`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: status === "CONFIRMED" ? JSON.stringify({ status }) : undefined,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Request failed");
      }
      const responseData = await res.json().catch(() => ({}));
      const updatedBooking = responseData.data as Booking | undefined;
      setBookings((b) =>
        b.map((bk) =>
          bk.id === id ? { ...bk, ...(updatedBooking ?? {}), status } : bk,
        ),
      );
      toast.success(
        status === "CONFIRMED"
          ? "Booking confirmed!"
          : "Session marked as completed!",
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Action failed";
      toast.error(message);
    } finally {
      setActionId(null);
    }
  };

  const filtered =
    filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const courseGroups = bookings.reduce<Record<string, Booking[]>>((acc, booking) => {
    const key = booking.course?.id ?? "unassigned";
    acc[key] = acc[key] ? [...acc[key], booking] : [booking];
    return acc;
  }, {});

  const renderBookingCard = (b: Booking, i: number) => {
    const paymentPaid = isPaymentPaid(b);
    const paymentLabel = paymentPaid ? "Payment verified" : "Payment pending";

    return (
      <motion.div
        key={b.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.06 }}
        className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">
            {b.student?.name || "Student"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {b.course?.title || "Course not assigned"}
          </p>
          {b.course?.category?.name && (
            <p className="mt-1 text-[11px] font-medium text-[#611f69] dark:text-[#c084fc]">
              {b.course.category.name}
            </p>
          )}
          {b.status === "PENDING" && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={paymentPaid ? "success" : "destructive"}>
                {paymentLabel}
              </Badge>
              {b.payment?.transactionId && (
                <span className="text-[11px] text-gray-400">
                  TXN: {b.payment.transactionId}
                </span>
              )}
            </div>
          )}
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {new Date(b.dateTime).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(b.dateTime).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-col sm:items-end">
          <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
          {b.status === "PENDING" && (
            <Button
              size="sm"
              disabled={actionId === b.id || !paymentPaid}
              title={
                paymentPaid
                  ? "Confirm this paid booking"
                  : "Payment must be completed before confirmation"
              }
              onClick={() => updateStatus(b.id, "CONFIRMED")}
              className="text-xs bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black h-7 px-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              {actionId === b.id ? "..." : "Confirm"}
            </Button>
          )}
          {b.status === "CONFIRMED" && (
            <Button
              size="sm"
              disabled={actionId === b.id}
              onClick={() => updateStatus(b.id, "COMPLETED")}
              className="text-xs bg-green-600 text-white hover:bg-green-700 h-7 px-3"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {actionId === b.id ? "..." : "Complete"}
            </Button>
          )}
          {b.status === "CONFIRMED" && b.meetingLink && (
            <Button
              size="sm"
              asChild
              className="h-7 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
            >
              <a href={b.meetingLink} target="_blank" rel="noreferrer">
                <Video className="mr-1 h-3.5 w-3.5" />
                Join Meet
              </a>
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-[#611f69] dark:text-[#c084fc]" />
          My Sessions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your teaching sessions
        </p>
      </div>

      <div className="mb-5 inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
        {[
          { key: "sessions", label: "Sessions", icon: CalendarDays },
          { key: "courses", label: "Courses", icon: BookOpen },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as "sessions" | "courses")}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium transition-colors ${
              viewMode === key
                ? "bg-[#611f69] text-white dark:bg-[#c084fc] dark:text-black"
                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {viewMode === "sessions" && (
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
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white dark:bg-gray-800 rounded-xl border animate-pulse" />
          ))}
        </div>
      ) : viewMode === "sessions" && filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No sessions found.</p>
        </div>
      ) : viewMode === "sessions" ? (
        <div className="space-y-3">
          {filtered.map(renderBookingCard)}
        </div>
      ) : Object.keys(courseGroups).length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No course sessions found.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(courseGroups).map(([courseId, items]) => (
            <div
              key={courseId}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {items[0].course?.title || "Course not assigned"}
                  </p>
                  {items[0].course?.category?.name && (
                    <p className="text-xs text-gray-500">
                      {items[0].course.category.name}
                    </p>
                  )}
                </div>
                <Badge variant="default">{items.length} sessions</Badge>
              </div>
              <div className="space-y-3">
                {items.map(renderBookingCard)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
