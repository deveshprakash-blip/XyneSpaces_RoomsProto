"use client";

import { useRouter, usePathname } from "next/navigation";
import { MessageCircle, FileText, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabBarProps {
  projectId: string;
  roomId: string;
}

const tabs = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "canvas", label: "Canvas", icon: FileText },
  { id: "board", label: "Board", icon: LayoutGrid },
] as const;

export function TabBar({ projectId, roomId }: TabBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = pathname?.split("/").pop() || "chat";

  return (
    <div className="border-b border-gray-200 bg-white px-6 flex-shrink-0">
      <div className="flex gap-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(`/project/${projectId}/room/${roomId}/${tab.id}`)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
