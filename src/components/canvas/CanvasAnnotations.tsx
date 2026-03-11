"use client";

import { CanvasAnnotation } from "@/types";
import { MessageSquare, Ticket, Sparkles, AlertTriangle, X } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { useUIStore } from "@/stores/uiStore";
import { formatRelative } from "@/lib/utils";

interface CanvasAnnotationsProps {
  annotations: CanvasAnnotation[];
  onClose: () => void;
}

const typeIcons: Record<string, typeof MessageSquare> = {
  ticket_reference: Ticket,
  ai_suggestion: Sparkles,
  human_comment: MessageSquare,
  nudge: AlertTriangle,
};

const typeBg: Record<string, string> = {
  ticket_reference: "border-l-blue-400 bg-blue-50",
  ai_suggestion: "border-l-purple-400 bg-purple-50",
  human_comment: "border-l-gray-400 bg-gray-50",
  nudge: "border-l-amber-400 bg-amber-50",
};

export function CanvasAnnotations({ annotations, onClose }: CanvasAnnotationsProps) {
  const getUserById = useUserStore((s) => s.getUserById);
  const openTicketDetail = useUIStore((s) => s.openTicketDetail);

  return (
    <div className="w-72 border-l border-gray-200 bg-white flex flex-col flex-shrink-0">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Annotations</span>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {annotations.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            No annotations yet. Select text and click &quot;Annotate&quot; to add one.
          </p>
        )}
        {annotations.map((ann) => {
          const Icon = typeIcons[ann.type] || MessageSquare;
          const author = ann.createdBy === "ai-agent" ? "Specky" : getUserById(ann.createdBy)?.name || ann.createdBy;

          return (
            <div
              key={ann.id}
              className={`border-l-4 rounded-r-lg p-3 ${typeBg[ann.type] || "bg-gray-50 border-l-gray-300"}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">{author}</span>
                <span className="text-[10px] text-gray-400">{formatRelative(ann.createdAt)}</span>
              </div>
              {ann.anchorText && (
                <div className="text-[11px] text-gray-400 italic mb-1 truncate">
                  &quot;{ann.anchorText}&quot;
                </div>
              )}
              <p className="text-sm text-gray-700">{ann.content}</p>
              {ann.linkedTicketId && (
                <button
                  onClick={() => openTicketDetail(ann.linkedTicketId!)}
                  className="mt-2 text-xs text-accent hover:underline flex items-center gap-1"
                >
                  <Ticket className="w-3 h-3" />
                  View linked ticket
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
