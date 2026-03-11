"use client";

import { useParams } from "next/navigation";
import { RoomHeader } from "@/components/layout/RoomHeader";
import { TabBar } from "@/components/layout/TabBar";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { useRoomStore } from "@/stores/roomStore";

export default function ChatPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const roomId = params.roomId as string;
  const room = useRoomStore((s) => s.getRoom(roomId));

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Room not found
      </div>
    );
  }

  return (
    <>
      <RoomHeader roomId={roomId} />
      <TabBar projectId={projectId} roomId={roomId} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MessageList chatId={room.chatId} projectId={projectId} roomId={roomId} />
        <MessageInput chatId={room.chatId} roomId={roomId} projectId={projectId} />
      </div>
    </>
  );
}
