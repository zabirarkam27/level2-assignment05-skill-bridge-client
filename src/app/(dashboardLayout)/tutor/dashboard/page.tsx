"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@tremor/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Booking } from "@/types/routes.type";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RecentNotifications from "@/components/notifications/RecentNotifications";

const money = (value: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);

const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

function StatCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <Card className="min-w-0 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-xs text-gray-400">{helper}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#611f69]/10 text-[#611f69] dark:bg-[#c084fc]/15 dark:text-[#c084fc]">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function TutorDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
          credentials: "include",
        });
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

  const analytics = useMemo(() => {
    const now = new Date();
    const paidBookings = bookings.filter((booking) => booking.payment?.status === "PAID");
    const completed = bookings.filter((booking) => booking.status === "COMPLETED");
    const upcoming = bookings
      .filter((booking) => booking.status === "CONFIRMED" && new Date(booking.dateTime) >= now)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    const uniqueStudents = new Set(bookings.map((booking) => booking.studentId)).size;
    const monthlyStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEarnings = paidBookings
      .filter((booking) => booking.payment && new Date(booking.payment.createdAt) >= monthlyStart)
      .reduce((sum, booking) => sum + (booking.payment?.amount ?? 0), 0);

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
    const earningsChart = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(sixMonthsAgo);
      date.setMonth(sixMonthsAgo.getMonth() + index);
      const key = monthKey(date);
      const total = paidBookings
        .filter((booking) => {
          if (!booking.payment) return false;
          return monthKey(new Date(booking.payment.createdAt)) === key;
        })
        .reduce((sum, booking) => sum + (booking.payment?.amount ?? 0), 0);

      return {
        month: monthFormatter.format(date),
        earnings: total,
      };
    });

    const sessionChart = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => ({
      status,
      count: bookings.filter((booking) => booking.status === status).length,
    }));

    return {
      monthlyEarnings,
      completedSessions: completed.length,
      upcomingSessions: upcoming.length,
      uniqueStudents,
      earningsChart,
      sessionChart,
      upcoming,
    };
  }, [bookings]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <LayoutDashboard className="h-6 w-6 text-[#611f69] dark:text-[#c084fc]" />
            Tutor Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Earnings, completed sessions, upcoming classes, and student activity
          </p>
        </div>
        <Button asChild className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black">
          <Link href="/">Back to Website</Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-xl bg-white dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Wallet className="h-5 w-5" />}
              label="Monthly Earnings"
              value={money(analytics.monthlyEarnings)}
              helper="Paid sessions this month"
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Completed Sessions"
              value={analytics.completedSessions}
              helper="Marked completed by tutor"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Upcoming Sessions"
              value={analytics.upcomingSessions}
              helper="Confirmed future bookings"
            />
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Students"
              value={analytics.uniqueStudents}
              helper="Unique learners booked"
            />
          </div>

          <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
            <Card className="min-w-0 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                Earnings Trend
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.earningsChart}>
                    <defs>
                      <linearGradient id="tutorEarnings" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => money(Number(value))} />
                    <Area type="monotone" dataKey="earnings" stroke="#0f766e" fill="url(#tutorEarnings)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="min-w-0 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                Session Status
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.sessionChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#611f69" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[1.2fr_1fr]">
            <Card className="min-w-0 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <CalendarDays className="h-4 w-4 text-[#611f69] dark:text-[#c084fc]" />
                Upcoming Sessions
              </h2>
              {analytics.upcoming.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">
                  No upcoming sessions yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {analytics.upcoming.slice(0, 6).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {booking.student?.name || "Student"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.course?.title || "Tutoring Session"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(booking.dateTime).toLocaleDateString("en-BD")} -{" "}
                          {new Date(booking.dateTime).toLocaleTimeString("en-BD", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Badge className="self-start sm:self-center" variant="warning">CONFIRMED</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <RecentNotifications />
          </div>
        </>
      )}
    </div>
  );
}
