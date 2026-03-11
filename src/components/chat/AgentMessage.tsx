"use client";

import { useRouter } from "next/navigation";
import { Message, ActionButton } from "@/types";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { formatTime } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";
import { useBoardStore } from "@/stores/boardStore";
import { useChatStore } from "@/stores/chatStore";
import { ArrowRight, Plus, X, ExternalLink } from "lucide-react";

interface AgentMessageProps {
  message: Message;
  projectId: string;
  roomId: string;
}

export function AgentMessage({ message, projectId, roomId }: AgentMessageProps) {
  const router = useRouter();
  const setSelectedCanvas = useUIStore((s) => s.setSelectedCanvas);
  const addTicket = useBoardStore((s) => s.addTicket);
  const addMessage = useChatStore((s) => s.addMessage);

  const handleAction = (btn: ActionButton) => {
    switch (btn.action) {
      case "navigate_board":
        router.push(`/project/${projectId}/room/${roomId}/board`);
        break;
      case "navigate_canvas":
        if (btn.payload?.canvasId) {
          setSelectedCanvas(String(btn.payload.canvasId));
        }
        router.push(`/project/${projectId}/room/${roomId}/canvas`);
        break;
      case "create_tickets":
        // Simulate creating tickets from canvas
        const newTickets = [
          { title: "Paint Save API", priority: "high" as const, tags: ["backend"], status: "To Do" },
          { title: "Paint Editor UI", priority: "high" as const, tags: ["frontend"], status: "To Do" },
          { title: "Paint Integration Tests", priority: "medium" as const, tags: ["qa"], status: "To Do" },
        ];
        newTickets.forEach((t) => {
          addTicket({
            ...t,
            boardId: `board-zhang-paint`,
            roomId,
            projectId,
            reporter: "ai-agent",
            sourceCanvasId: btn.payload?.canvasId ? String(btn.payload.canvasId) : undefined,
          });
        });
        addMessage(
          message.chatId,
          "✅ Created 3 tickets on the board! View them to review assignments and priorities.",
          "ai-agent",
          "agent",
          "agent_update",
          [{ id: "nav-board", label: "View on Board →", action: "navigate_board" }]
        );
        break;
      case "dismiss":
        break;
    }
  };

  return (
    <div className="flex gap-3 px-6 py-2">
      <UserAvatar userId="ai-agent" size="md" className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm text-purple-700">Specky</span>
          <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">
            AI Agent
          </span>
          <span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>
        </div>
        <div className="mt-1 bg-agent-bg border border-agent-border rounded-lg p-3">
          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {renderContent(message.content)}
          </div>
          {message.actionButtons && message.actionButtons.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-purple-200">
              {message.actionButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleAction(btn)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    btn.action === "dismiss"
                      ? "text-gray-500 bg-white border border-gray-200 hover:bg-gray-50"
                      : btn.action === "create_tickets"
                      ? "text-white bg-accent hover:bg-accent-hover"
                      : "text-accent bg-white border border-accent/30 hover:bg-blue-50"
                  }`}
                >
                  {btn.action === "navigate_board" && <ArrowRight className="w-3 h-3" />}
                  {btn.action === "navigate_canvas" && <ExternalLink className="w-3 h-3" />}
                  {btn.action === "create_tickets" && <Plus className="w-3 h-3" />}
                  {btn.action === "dismiss" && <X className="w-3 h-3" />}
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`|#[A-Z]+-\d+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="bg-purple-200/50 text-purple-800 px-1 py-0.5 rounded text-xs">{part.slice(1, -1)}</code>;
    }
    if (part.match(/^#[A-Z]+-\d+$/)) {
      return (
        <span key={i} className="text-accent font-medium cursor-pointer hover:underline">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
