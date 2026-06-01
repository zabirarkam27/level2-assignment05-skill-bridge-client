"use client";

import Link from "next/link";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "./useNotifications";
import { AppNotification } from "@/types/routes.type";

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: AppNotification;
  onRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const content = (
    <div
      className={`rounded-lg p-3 text-left transition-colors ${
        notification.isRead
          ? "hover:bg-gray-50 dark:hover:bg-gray-800"
          : "bg-[#611f69]/5 hover:bg-[#611f69]/10 dark:bg-[#c084fc]/10"
      }`}
      onClick={() => onRead(notification.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {notification.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
            {notification.message}
          </p>
          <p className="mt-1 text-[11px] text-gray-400">
            {timeAgo(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#611f69] dark:bg-[#c084fc]" />
        )}
      </div>
    </div>
  );

  return (
    <div className="group relative">
      {notification.link ? (
        <Link href={notification.link}>{content}</Link>
      ) : (
        <button className="w-full">{content}</button>
      )}
      <button
        aria-label="Delete notification"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDelete(notification.id);
        }}
        className="absolute right-2 top-2 hidden rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 group-hover:block dark:hover:bg-red-950/40"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function NotificationBell({ enabled = true }: { enabled?: boolean }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(enabled);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <div className="flex items-center justify-between px-2 py-2">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Notifications
            </p>
            <p className="text-xs text-gray-400">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={markAllAsRead}
              className="h-8 px-2 text-xs"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Read all
            </Button>
          )}
        </div>
        <div className="max-h-96 space-y-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              No notifications yet.
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
