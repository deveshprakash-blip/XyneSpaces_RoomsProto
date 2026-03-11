"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { BoardColumn as BoardColumnType, Ticket } from "@/types";
import { TicketCard } from "./TicketCard";
import { Plus } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";

interface BoardColumnProps {
  column: BoardColumnType;
  tickets: Ticket[];
  boardId: string;
  roomId: string;
  projectId: string;
}

export function BoardColumn({ column, tickets, boardId, roomId, projectId }: BoardColumnProps) {
  const openCreateTicket = useUIStore((s) => s.openCreateTicket);

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px] bg-gray-50 rounded-lg">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">{column.name}</h3>
          <span className="text-xs bg-gray-200 text-gray-500 rounded-full px-2 py-0.5 font-medium">
            {tickets.length}
          </span>
        </div>
        <button
          onClick={() => openCreateTicket({ status: column.name, boardId, roomId, projectId })}
          className="p-1 text-gray-400 hover:text-accent hover:bg-gray-200 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={column.name}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 px-2 pb-2 space-y-2 min-h-[100px] rounded-b-lg transition-colors ${
              snapshot.isDraggingOver ? "bg-accent/5" : ""
            }`}
          >
            {tickets.map((ticket, index) => (
              <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                {(provided) => (
                  <TicketCard ticket={ticket} provided={provided} />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
