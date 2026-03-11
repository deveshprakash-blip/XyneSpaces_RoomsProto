import { create } from "zustand";
import { Notification } from "@/types";
import { notifications } from "@/data/seed";
import { generateId } from "@/lib/utils";

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  getNotifications: () => Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (n: Omit<Notification, "id" | "createdAt" | "isRead">) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: notifications,
  unreadCount: notifications.filter((n) => !n.isRead).length,
  getNotifications: () => get().notifications.sort((a, b) => b.createdAt - a.createdAt),
  markAsRead: (id) => {
    set((s) => {
      const updated = s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return { notifications: updated, unreadCount: updated.filter((n) => !n.isRead).length };
    });
  },
  markAllAsRead: () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
  addNotification: (n) => {
    const newNotif: Notification = {
      ...n,
      id: `notif-${generateId()}`,
      isRead: false,
      createdAt: Date.now(),
    };
    set((s) => ({
      notifications: [newNotif, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    }));
  },
}));
