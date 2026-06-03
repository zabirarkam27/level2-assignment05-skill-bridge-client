"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  CalendarCheck,
  FolderOpen,
  LayoutDashboard,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RecentNotifications from "@/components/notifications/RecentNotifications";
import { cn } from "@/lib/utils";

type AdminStats = {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalBookings: number;
  totalCategories: number;
  completedBookings: number;
  revenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  bookingStatusData: { status: string; count: number }[];
  popularCourses: {
    id: string;
    title: string;
    category: string;
    tutor: string;
    bookings: number;
    saved: number;
  }[];
  topTutors: {
    id: string;
    name: string;
    rating: number;
    bookings: number;
    reviews: number;
    revenue: number;
  }[];
};

const defaultStats: AdminStats = {
  totalUsers: 0,
  totalStudents: 0,
  totalTutors: 0,
  totalBookings: 0,
  totalCategories: 0,
  completedBookings: 0,
  revenue: 0,
  monthlyRevenue: [],
  bookingStatusData: [],
  popularCourses: [],
  topTutors: [],
};

const statusColors = ["#611f69", "#0f766e", "#2563eb", "#dc2626"];

const money = (value: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);

const quickActions = [
  { label: "Manage Users", href: "/admin/users" },
  { label: "View Bookings", href: "/admin/bookings" },
  { label: "Manage Courses", href: "/admin/courses" },
  { label: "Payments", href: "/admin/payments" },
];

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn(className)}>{children}</section>;
}

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

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="min-w-0 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      <div className="h-72">{children}</div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
          credentials: "include",
        });
        const data = await res.json();
        setStats({ ...defaultStats, ...(data.data ?? {}) });
      } catch {
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      icon: <Users className="h-5 w-5" />,
      label: "Total Users",
      value: stats.totalUsers,
      helper: `${stats.totalStudents} students, ${stats.totalTutors} tutors`,
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      label: "Revenue",
      value: money(stats.revenue),
      helper: "Paid Stripe bookings",
    },
    {
      icon: <CalendarCheck className="h-5 w-5" />,
      label: "Bookings",
      value: stats.totalBookings,
      helper: `${stats.completedBookings} completed sessions`,
    },
    {
      icon: <FolderOpen className="h-5 w-5" />,
      label: "Categories",
      value: stats.totalCategories,
      helper: "Course catalog coverage",
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <LayoutDashboard className="h-6 w-6 text-[#611f69] dark:text-[#c084fc]" />
            Admin Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Platform health, revenue, bookings, courses, and tutor performance
          </p>
        </div>
        <Button asChild className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black">
          <Link href="/">Back to Website</Link>
        </Button>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <TrendingUp className="h-4 w-4 text-[#611f69] dark:text-[#c084fc]" />
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-[#611f69] hover:bg-[#611f69]/5 dark:border-gray-700 dark:text-gray-300"
            >
              {item.label}
            </Link>
          ))}
        </div>
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
            {cards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
            <ChartCard title="Monthly Revenue">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyRevenue}>
                  <defs>
                    <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#611f69" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#611f69" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => money(Number(value))} />
                  <Area type="monotone" dataKey="revenue" stroke="#611f69" fill="url(#revenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Booking Status">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.bookingStatusData} dataKey="count" nameKey="status" innerRadius={58} outerRadius={96} paddingAngle={4}>
                    {stats.bookingStatusData.map((entry, index) => (
                      <Cell key={entry.status} fill={statusColors[index % statusColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
            <Card className="min-w-0 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <BookOpen className="h-4 w-4 text-[#611f69] dark:text-[#c084fc]" />
                Popular Courses
              </h2>
              <div className="space-y-3">
                {stats.popularCourses.map((course) => (
                  <Link key={course.id} href={`/courses/${course.id}`} className="flex flex-col gap-3 rounded-lg border border-gray-100 p-3 transition hover:border-[#611f69]/40 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                        {course.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {course.category} - {course.tutor}
                      </span>
                    </span>
                    <span className="text-left text-xs text-gray-500 sm:text-right">
                      <strong className="block text-sm text-gray-900 dark:text-white">{course.bookings}</strong>
                      bookings
                    </span>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="min-w-0 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <Star className="h-4 w-4 text-[#611f69] dark:text-[#c084fc]" />
                Top Tutors
              </h2>
              <div className="space-y-3">
                {stats.topTutors.map((tutor) => (
                  <Link key={tutor.id} href={`/mentors/${tutor.id}`} className="flex flex-col gap-3 rounded-lg border border-gray-100 p-3 transition hover:border-[#611f69]/40 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                        {tutor.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {tutor.bookings} bookings - {tutor.reviews} reviews
                      </span>
                    </span>
                    <span className="text-left text-xs text-gray-500 sm:text-right">
                      <strong className="block text-sm text-gray-900 dark:text-white">{money(tutor.revenue)}</strong>
                      revenue
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[1fr_1.2fr]">
            <RecentNotifications />
            <ChartCard title="Course Booking Volume">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.popularCourses}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="title" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
