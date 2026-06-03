"use client";

import { useSessionContext } from "@/context/SessionContext";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Menu, Clock, XCircle, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/lib/logout";
import GlobalSearch from "@/components/search/GlobalSearch";
import NotificationBell from "@/components/notifications/NotificationBell";

function PendingScreen() {
  const { refetch } = useSessionContext();
  const logout = useLogout();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-10">
        <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Application Under Review
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Your tutor application has been submitted and is currently being
          reviewed by our team. You will be able to access your dashboard once
          an admin approves your account.
        </p>
        <button
          onClick={() => logout(refetch)}
          type="button"
          className="mt-6 text-sm text-red-500 hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function RejectedScreen() {
  const { refetch } = useSessionContext();
  const logout = useLogout();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-10">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Application Not Approved
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Unfortunately, your tutor application was not approved at this time.
          Please contact our support team for more information.
        </p>
        <button
          onClick={() => logout(refetch)}
          type="button"
          className="mt-6 text-sm text-red-500 hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function getAllowedRole(pathname: string) {
  if (pathname.startsWith("/admin")) return "ADMIN";
  if (pathname.startsWith("/tutor")) return "TUTOR";
  if (pathname.startsWith("/dashboard/")) return "STUDENT";
  return null;
}

function getDashboardHome(role?: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "TUTOR") return "/tutor/dashboard";
  return "/dashboard";
}

function ForbiddenScreen({ role }: { role?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <ShieldAlert className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          Access Denied
        </h1>
        <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Your account does not have permission to view this dashboard area.
        </p>
        <button
          type="button"
          onClick={() => window.location.assign(getDashboardHome(role))}
          className="mt-6 rounded-md bg-[#611f69] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]"
        >
          Go to my dashboard
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useSessionContext();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#611f69] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (user.status === "PENDING") return <PendingScreen />;
  if (user.status === "REJECTED") return <RejectedScreen />;

  const allowedRole = getAllowedRole(pathname);
  if (allowedRole && user.role !== allowedRole) {
    return <ForbiddenScreen role={user.role} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <DashboardSidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button
            onClick={() => setSidebarOpen(true)}
            title="Open sidebar"
            aria-label="Open sidebar"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link
            href="/"
            className="font-semibold text-[#611f69] transition-colors hover:text-[#4a174f] dark:text-[#c084fc] dark:hover:text-[#d8b4fe]"
          >
            SkillBridge
          </Link>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </div>

        <div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <GlobalSearch canSearchUsers={user.role === "ADMIN"} />
            </div>
            <div className="hidden lg:block">
              <NotificationBell />
            </div>
          </div>
        </div>

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
