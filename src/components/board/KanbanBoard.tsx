"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useBoardStore } from "@/stores/boardStore";
import { BoardColumn } from "./BoardColumn";

interface KanbanBoardProps {
  boardId: string;
  roomId: string;
  projectId: string;
}

export function KanbanBoard({ boardId, roomId, projectId }: KanbanBoardProps) {
  const board = useBoardStore((s) => s.getBoard(boardId));
  const getTicketsByBoard = useBoardStore((s) => s.getTicketsByBoard);
  const moveTicket = useBoardStore((s) => s.moveTicket);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!board) return <div className="p-8 text-gray-400">Board not found</div>;
  if (!mounted) return <div className="p-8 text-gray-400">Loading board...</div>;

  const allTickets = getTicketsByBoard(boardId);
  const columns = [...board.columns].sort((a, b) => a.order - b.order);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    moveTicket(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 p-4 overflow-x-auto h-full">
        {columns.map((col) => {
          const colTickets = allTickets.filter((t) => t.status === col.name);
          return (
            <BoardColumn
              key={col.id}
              column={col}
              tickets={colTickets}
              boardId={boardId}
              roomId={roomId}
              projectId={projectId}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
