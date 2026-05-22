"use client";

import { useEffect, useState } from "react";
import { Booking } from "@/types/routes.type";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Star,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function StatCard({
  icon,
  label,
  value,
  color,
  index,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </motion.div>
  );
}

export default function TutorDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, []);

  const completed = bookings.filter((b) => b.status === "COMPLETED").length;
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
  const uniqueStudents = new Set(bookings.map((b) => b.studentId)).size;

  const stats = [
    {
      icon: <CalendarDays className="w-5 h-5 text-blue-600" />,
      label: "Total Sessions",
      value: bookings.length,
      color: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      label: "Upcoming",
      value: confirmed,
      color: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      icon: <Star className="w-5 h-5 text-green-600" />,
      label: "Completed",
      value: completed,
      color: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: <Users className="w-5 h-5 text-purple-600" />,
      label: "Students",
      value: uniqueStudents,
      color: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  const upcoming = bookings
    .filter((b) => b.status === "CONFIRMED")
    .slice(0, 5);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-[#611f69] dark:text-[#c084fc]" />
            Tutor Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Overview of your teaching activity
          </p>
        </div>
        <Button
          asChild
          className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]"
        >
          <Link href="/">Back to Website</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      {/* Upcoming sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#611f69] dark:text-[#c084fc]" />
          Upcoming Sessions
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No upcoming sessions. Share your profile to get bookings!
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {booking.student?.name || "Student"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(booking.dateTime).toLocaleDateString()} • {new Date(booking.dateTime).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Badge variant="warning">CONFIRMED</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
