"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "./useNotifications";

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function RecentNotifications() {
  const { notifications, loading, markAsRead } = useNotifications(true);
  const recent = notifications.slice(0, 5);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
        <Bell className="h-4 w-4 text-[#611f69] dark:text-[#c084fc]" />
        Recent Notifications
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          No recent notifications.
        </p>
      ) : (
        <div className="space-y-3">
          {recent.map((notification) => {
            const body = (
              <div
                className="flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                onClick={() => markAsRead(notification.id)}
              >
                <span
                  className={`mt-1.5 h-2 w-2 rounded-full ${
                    notification.isRead
                      ? "bg-gray-300"
                      : "bg-[#611f69] dark:bg-[#c084fc]"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {notification.message}
                  </p>
                </div>
                <span className="text-[11px] text-gray-400">
                  {timeAgo(notification.createdAt)}
                </span>
              </div>
            );

            return notification.link ? (
              <Link key={notification.id} href={notification.link}>
                {body}
              </Link>
            ) : (
              <div key={notification.id}>{body}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
