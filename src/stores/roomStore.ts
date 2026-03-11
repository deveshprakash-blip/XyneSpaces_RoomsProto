import { create } from "zustand";
import { Room } from "@/types";
import { rooms } from "@/data/seed";
import { generateId } from "@/lib/utils";

interface RoomStore {
  rooms: Room[];
  getRoom: (id: string) => Room | undefined;
  getRoomsByProject: (projectId: string) => Room[];
  addRoom: (projectId: string, name: string, type: "general" | "feature") => Room;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  rooms: rooms,
  getRoom: (id) => get().rooms.find((r) => r.id === id),
  getRoomsByProject: (projectId) => get().rooms.filter((r) => r.projectId === projectId),
  addRoom: (projectId, name, type) => {
    const id = `room-${generateId()}`;
    const newRoom: Room = {
      id,
      projectId,
      name,
      type,
      contextFilePath: `${name.toLowerCase().replace(/\s/g, "-")}.md`,
      members: [{ userId: "user-rishabh", role: "owner", addedBy: "user-rishabh", addedAt: Date.now() }],
      chatId: `chat-${id}`,
      canvasIds: [],
      boardId: `board-${id}`,
      createdBy: "user-rishabh",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ rooms: [...s.rooms, newRoom] }));
    return newRoom;
  },
}));
