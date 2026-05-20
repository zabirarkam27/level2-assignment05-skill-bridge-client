"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  FolderOpen,
  TrendingUp,
  LayoutDashboard,
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
  value: number;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalCategories: 0,
    totalTutors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, bookingsRes, categoriesRes] = await Promise.allSettled([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, { credentials: "include" }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`, { credentials: "include" }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`),
        ]);

        const users = usersRes.status === "fulfilled" ? await usersRes.value.json() : { data: [] };
        const bookings = bookingsRes.status === "fulfilled" ? await bookingsRes.value.json() : { data: [] };
        const categories = categoriesRes.status === "fulfilled" ? await categoriesRes.value.json() : { data: [] };

        const usersArr = Array.isArray(users.data) ? users.data : [];
        setStats({
          totalUsers: usersArr.length,
          totalTutors: usersArr.filter((u: any) => u.role === "TUTOR").length,
          totalBookings: Array.isArray(bookings.data) ? bookings.data.length : 0,
          totalCategories: Array.isArray(categories.data) ? categories.data.length : 0,
        });
      } catch {
        /* keep defaults */
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      label: "Total Users",
      value: stats.totalUsers,
      color: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      label: "Active Tutors",
      value: stats.totalTutors,
      color: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
      label: "Total Bookings",
      value: stats.totalBookings,
      color: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: <FolderOpen className="w-6 h-6 text-orange-600" />,
      label: "Categories",
      value: stats.totalCategories,
      color: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-[#611f69] dark:text-[#c084fc]" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Platform overview and statistics
          </p>
        </div>
        <Button
          asChild
          className="
          bg-[#611f69] text-white
          hover:bg-[#4a174f]
          dark:bg-[#c084fc]
          dark:text-black
          dark:hover:bg-[#d8b4fe]
        "
        >
          <Link href="/">Back to Website</Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-100 dark:bg-gray-600 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, i) => <StatCard key={c.label} {...c} index={i} />)}
        </div>
      )}

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Manage Users", href: "/admin/users", icon: <Users className="w-4 h-4" /> },
            { label: "View Bookings", href: "/admin/bookings", icon: <BookOpen className="w-4 h-4" /> },
            { label: "Manage Categories", href: "/admin/categories", icon: <FolderOpen className="w-4 h-4" /> },
            { label: "Manage Courses", href: "/admin/courses", icon: <BookOpen className="w-4 h-4" /> },
          ].map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#611f69] dark:hover:border-[#c084fc] hover:bg-[#611f69]/5 transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <span className="text-[#611f69] dark:text-[#c084fc]">{a.icon}</span>
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
