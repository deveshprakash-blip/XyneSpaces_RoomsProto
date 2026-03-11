"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { RoomHeader } from "@/components/layout/RoomHeader";
import { TabBar } from "@/components/layout/TabBar";
import { useRoomStore } from "@/stores/roomStore";

const KanbanBoard = dynamic(
  () => import("@/components/board/KanbanBoard").then((m) => ({ default: m.KanbanBoard })),
  { ssr: false, loading: () => <div className="p-8 text-gray-400">Loading board...</div> }
);

export default function BoardPage() {
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
      <div className="flex-1 overflow-hidden bg-gray-100">
        <KanbanBoard boardId={room.boardId} roomId={roomId} projectId={projectId} />
      </div>
    </>
  );
}
