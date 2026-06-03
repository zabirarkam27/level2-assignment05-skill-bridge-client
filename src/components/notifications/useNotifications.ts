"use client";

import { useCallback, useEffect, useState } from "react";
import { AppNotification } from "@/types/routes.type";

type Listener = (notifications: AppNotification[], loading: boolean) => void;

let cachedNotifications: AppNotification[] = [];
let cachedLoading = true;
let intervalId: number | null = null;
let inFlightRequest: Promise<void> | null = null;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) =>
    listener(cachedNotifications, cachedLoading),
  );
}

async function fetchNotificationCache() {
  if (inFlightRequest) return inFlightRequest;

  cachedLoading = true;
  notifyListeners();

  inFlightRequest = fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
    credentials: "include",
    cache: "no-store",
  })
    .then(async (res) => {
      const data = await res.json();
      cachedNotifications = Array.isArray(data.data) ? data.data : [];
    })
    .catch(() => {
      cachedNotifications = [];
    })
    .finally(() => {
      cachedLoading = false;
      inFlightRequest = null;
      notifyListeners();
    });

  return inFlightRequest;
}

function updateNotificationCache(
  updater: (notifications: AppNotification[]) => AppNotification[],
) {
  cachedNotifications = updater(cachedNotifications);
  cachedLoading = false;
  notifyListeners();
}

function subscribeToNotifications(listener: Listener) {
  listeners.add(listener);
  listener(cachedNotifications, cachedLoading);

  if (listeners.size === 1) {
    fetchNotificationCache();
    intervalId = window.setInterval(fetchNotificationCache, 30000);
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };
}

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState(cachedNotifications);
  const [loading, setLoading] = useState(cachedLoading);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) {
      setNotifications(cachedNotifications);
      setLoading(false);
      return;
    }

    await fetchNotificationCache();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    return subscribeToNotifications((nextNotifications, nextLoading) => {
      setNotifications(nextNotifications);
      setLoading(nextLoading);
    });
  }, [enabled]);

  const markAsRead = async (id: string) => {
    updateNotificationCache((prev) =>
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
    updateNotificationCache((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
      method: "PATCH",
      credentials: "include",
    }).catch(() => fetchNotifications());
  };

  const deleteNotification = async (id: string) => {
    updateNotificationCache((prev) =>
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
