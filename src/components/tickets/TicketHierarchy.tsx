"use client";

import { useBoardStore } from "@/stores/boardStore";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { ChevronRight, CornerLeftUp, ExternalLink } from "lucide-react";

interface TicketHierarchyProps {
  ticketId: string;
}

export function TicketHierarchy({ ticketId }: TicketHierarchyProps) {
  const getTicket = useBoardStore((s) => s.getTicket);
  const getProject = useProjectStore((s) => s.getProject);
  const openTicketDetail = useUIStore((s) => s.openTicketDetail);

  const ticket = getTicket(ticketId);
  if (!ticket) return null;

  const parentTicket = ticket.parentTicketId ? getTicket(ticket.parentTicketId) : null;

  return (
    <div className="space-y-1.5">
      {parentTicket && (
        <button
          onClick={() => openTicketDetail(parentTicket.id)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          <CornerLeftUp className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-mono text-xs text-gray-400">{parentTicket.displayId}</span>
          <span>{parentTicket.title}</span>
          <span className="text-[10px] text-gray-400">
            {getProject(parentTicket.projectId)?.name}
          </span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </button>
      )}
      <div className="flex items-center gap-2 text-sm font-medium text-blue-600 pl-4">
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-mono text-xs">{ticket.displayId}</span>
        <span>{ticket.title}</span>
        <span className="text-[10px] bg-blue-50 px-1.5 py-0.5 rounded">current</span>
      </div>
      {ticket.subTicketIds.map((subId) => {
        const sub = getTicket(subId);
        if (!sub) return null;
        return (
          <button
            key={subId}
            onClick={() => openTicketDetail(subId)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors pl-8"
          >
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-mono text-xs text-gray-400">{sub.displayId}</span>
            <span>{sub.title}</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </button>
        );
      })}
    </div>
  );
}
