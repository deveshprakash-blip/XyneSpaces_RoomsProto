"use client";

import { X, Bell, Check, AlertTriangle, GitBranch, Link2, FileText, Sparkles, ArrowUpDown } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { Notification } from "@/types";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, typeof Bell> = {
  cross_team_request: GitBranch,
  ticket_status_change: ArrowUpDown,
  dependency_unblocked: Check,
  linking_nudge: Link2,
  approval_request: FileText,
  agent_update: Sparkles,
  mention: AlertTriangle,
};

const typeColors: Record<string, string> = {
  cross_team_request: "text-blue-500 bg-blue-50",
  ticket_status_change: "text-green-500 bg-green-50",
  dependency_unblocked: "text-emerald-500 bg-emerald-50",
  linking_nudge: "text-amber-500 bg-amber-50",
  approval_request: "text-purple-500 bg-purple-50",
  agent_update: "text-purple-500 bg-purple-50",
  mention: "text-red-500 bg-red-50",
};

export function NotificationPanel() {
  const { showNotifications, toggleNotifications } = useUIStore();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
  const openTicketDetail = useUIStore((s) => s.openTicketDetail);

  if (!showNotifications) return null;

  const sorted = [...notifications].sort((a, b) => b.createdAt - a.createdAt);

  const handleNotifClick = (notif: Notification) => {
    markAsRead(notif.id);
    if (notif.linkedEntityType === "ticket" && notif.linkedEntityId) {
      openTicketDetail(notif.linkedEntityId);
    }
    if (notif.linkedEntityType === "canvas" && notif.linkedEntityId) {
      useUIStore.getState().setSelectedCanvas(notif.linkedEntityId);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/10 z-40" onClick={toggleNotifications} />
      <div className="fixed right-0 top-0 bottom-0 w-[380px] bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-accent hover:underline"
              >
                Mark all read
              </button>
            )}
            <button onClick={toggleNotifications} className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {sorted.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;
            const colorClass = typeColors[notif.type] || "text-gray-500 bg-gray-50";

            return (
              <button
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={cn(
                  "w-full flex items-start gap-3 px-5 py-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors",
                  !notif.isRead && "bg-blue-50/30"
                )}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium truncate", notif.isRead ? "text-gray-600" : "text-gray-900")}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatRelative(notif.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
