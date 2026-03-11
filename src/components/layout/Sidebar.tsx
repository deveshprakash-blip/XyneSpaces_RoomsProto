"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Hash,
  Plus,
  Bell,
  MessageSquare,
  FolderOpen,
  Sparkles,
  User,
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useRoomStore } from "@/stores/roomStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const projects = useProjectStore((s) => s.projects);
  const getRoomsByProject = useRoomStore((s) => s.getRoomsByProject);
  const addRoom = useRoomStore((s) => s.addRoom);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const toggleNotifications = useUIStore((s) => s.toggleNotifications);

  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [addingRoom, setAddingRoom] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");

  const toggleProject = (id: string) => {
    setExpandedProjects((p) => ({ ...p, [id]: !p[id] }));
  };

  const handleRoomClick = (projectId: string, roomId: string) => {
    router.push(`/project/${projectId}/room/${roomId}/chat`);
  };

  const handleAddRoom = (projectId: string) => {
    if (newRoomName.trim()) {
      const room = addRoom(projectId, newRoomName.trim(), "feature");
      setNewRoomName("");
      setAddingRoom(null);
      router.push(`/project/${projectId}/room/${room.id}/chat`);
    }
  };

  const isActiveRoom = (projectId: string, roomId: string) => {
    return pathname?.includes(`/project/${projectId}/room/${roomId}`);
  };

  return (
    <aside className="w-60 h-screen bg-sidebar-bg flex flex-col flex-shrink-0 text-sidebar-text">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-sidebar-text-active">Juspay Workspace</span>
        </div>
        <button
          onClick={toggleNotifications}
          className="relative p-1.5 rounded-md hover:bg-sidebar-hover transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto dark-scroll py-2">
        {projects.map((project) => {
          const rooms = getRoomsByProject(project.id);
          const isExpanded = expandedProjects[project.id];

          return (
            <div key={project.id} className="mb-1">
              <button
                onClick={() => toggleProject(project.id)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="truncate">{project.name}</span>
              </button>

              {isExpanded && (
                <div className="mt-0.5">
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleRoomClick(project.id, room.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-4 pl-8 py-1.5 text-sm transition-colors",
                        isActiveRoom(project.id, room.id)
                          ? "bg-sidebar-active text-sidebar-text-active"
                          : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active"
                      )}
                    >
                      {room.type === "general" ? (
                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                      ) : (
                        <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                      <span className="truncate">{room.name}</span>
                    </button>
                  ))}

                  {/* Add Room */}
                  {addingRoom === project.id ? (
                    <div className="px-4 pl-8 py-1">
                      <input
                        autoFocus
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddRoom(project.id);
                          if (e.key === "Escape") setAddingRoom(null);
                        }}
                        onBlur={() => setAddingRoom(null)}
                        placeholder="Room name..."
                        className="w-full bg-sidebar-hover text-sidebar-text-active text-sm px-2 py-1 rounded border border-white/10 outline-none focus:border-accent"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingRoom(project.id)}
                      className="w-full flex items-center gap-2 px-4 pl-8 py-1.5 text-xs text-sidebar-text/60 hover:text-sidebar-text hover:bg-sidebar-hover transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New Room</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-2 p-1.5">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-medium text-sidebar-text-active truncate">Guest</p>
            <p className="text-[10px] text-sidebar-text truncate">Auth disabled</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
