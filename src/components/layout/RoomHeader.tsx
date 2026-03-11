"use client";

import { Phone, Users } from "lucide-react";
import { useRoomStore } from "@/stores/roomStore";
import { UserAvatar } from "@/components/shared/UserAvatar";

interface RoomHeaderProps {
  roomId: string;
}

export function RoomHeader({ roomId }: RoomHeaderProps) {
  const room = useRoomStore((s) => s.getRoom(roomId));
  if (!room) return null;

  return (
    <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white flex-shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-900">{room.name}</h1>
        {room.type === "feature" && (
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            Feature
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {room.members.slice(0, 4).map((m) => (
            <UserAvatar key={m.userId} userId={m.userId} size="sm" className="ring-2 ring-white" />
          ))}
          {room.members.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600 ring-2 ring-white">
              +{room.members.length - 4}
            </div>
          )}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          <Phone className="w-3.5 h-3.5" />
          Huddle
        </button>
        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
          <Users className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
