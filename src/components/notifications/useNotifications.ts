"use client";

import { useCallback, useEffect, useState } from "react";
import { AppNotification } from "@/types/routes.type";

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      setNotifications(Array.isArray(data.data) ? data.data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchNotifications();
    if (!enabled) return;

    const interval = window.setInterval(fetchNotifications, 30000);
    return () => window.clearInterval(interval);
  }, [enabled, fetchNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    );
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    }).catch(() => fetchNotifications());
  };

  const markAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
      method: "PATCH",
      credentials: "include",
    }).catch(() => fetchNotifications());
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).catch(() => fetchNotifications());
  };

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((notification) => !notification.isRead)
      .length,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
