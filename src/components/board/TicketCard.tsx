"use client";

import { Ticket } from "@/types";
import { DraggableProvided } from "@hello-pangea/dnd";
import { useBoardStore } from "@/stores/boardStore";
import { useUIStore } from "@/stores/uiStore";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { getPriorityColor } from "@/lib/utils";
import { AlertTriangle, GitBranch, CornerLeftUp } from "lucide-react";
import { useState } from "react";

interface TicketCardProps {
  ticket: Ticket;
  provided: DraggableProvided;
}

export function TicketCard({ ticket, provided }: TicketCardProps) {
  const getTicket = useBoardStore((s) => s.getTicket);
  const openTicketDetail = useUIStore((s) => s.openTicketDetail);
  const openCreateTicket = useUIStore((s) => s.openCreateTicket);
  const openLinkTicket = useUIStore((s) => s.openLinkTicket);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const parentTicket = ticket.parentTicketId ? getTicket(ticket.parentTicketId) : null;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  return (
    <>
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        onClick={() => openTicketDetail(ticket.id)}
        onContextMenu={handleContextMenu}
        className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-mono text-gray-400">{ticket.displayId}</span>
          <div className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(ticket.priority)}`} title={ticket.priority} />
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{ticket.title}</p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {parentTicket && (
            <span
              className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-100"
              onClick={(e) => {
                e.stopPropagation();
                openTicketDetail(parentTicket.id);
              }}
            >
              <CornerLeftUp className="w-2.5 h-2.5" />
              {parentTicket.displayId}
            </span>
          )}
          {ticket.subTicketIds.length > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              <GitBranch className="w-2.5 h-2.5" />
              Sub: {ticket.subTicketIds.length}
            </span>
          )}
          {ticket.hasNudge && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded" title={ticket.nudgeMessage}>
              <AlertTriangle className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {/* Tags + Assignee */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {ticket.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
          {ticket.assignee && (
            <UserAvatar userId={ticket.assignee} size="sm" />
          )}
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowContextMenu(false)} />
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]"
            style={{ left: menuPos.x, top: menuPos.y }}
          >
            {[
              { label: "View ticket", action: () => openTicketDetail(ticket.id) },
              { label: "Add sub-ticket", action: () => openCreateTicket({ parentTicketId: ticket.id, boardId: ticket.boardId, roomId: ticket.roomId, projectId: ticket.projectId }) },
              { label: "Link to existing ticket", action: () => openLinkTicket(ticket.id) },
              { label: "View hierarchy", action: () => { useUIStore.getState().openFeatureGraph(ticket.id); } },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setShowContextMenu(false);
                  item.action();
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
