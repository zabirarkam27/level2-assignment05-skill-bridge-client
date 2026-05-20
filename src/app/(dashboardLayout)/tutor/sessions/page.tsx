"use client";

import { useEffect, useState } from "react";
import { Booking, BookingStatus } from "@/types/routes.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CalendarDays, Clock, CheckCircle2, Check } from "lucide-react";
import { motion } from "framer-motion";

const statusVariant: Record<BookingStatus, "default" | "warning" | "success" | "destructive"> = {
  PENDING: "default",
  CONFIRMED: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export default function TutorSessionsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");

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
      setBookings((b) =>
        b.map((bk) => (bk.id === id ? { ...bk, status } : bk)),
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

      {/* Filter */}
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

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white dark:bg-gray-800 rounded-xl border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No sessions found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  {b.student?.name || "Student"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {"Tutoring Session"}
                </p>
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
              <div className="flex flex-col items-end gap-2">
                <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
                {b.status === "PENDING" && (
                  <Button
                    size="sm"
                    disabled={actionId === b.id}
                    onClick={() => updateStatus(b.id, "CONFIRMED")}
                    className="text-xs bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black h-7 px-3"
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
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
