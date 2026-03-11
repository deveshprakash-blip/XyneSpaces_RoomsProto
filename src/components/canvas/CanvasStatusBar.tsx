"use client";

import { Canvas } from "@/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCanvasStore } from "@/stores/canvasStore";
import { useChatStore } from "@/stores/chatStore";
import { useRoomStore } from "@/stores/roomStore";
import { useRouter } from "next/navigation";
import { CheckCircle, Send, Eye } from "lucide-react";
import { useState } from "react";

interface CanvasStatusBarProps {
  canvas: Canvas;
  projectId: string;
  roomId: string;
}

export function CanvasStatusBar({ canvas, projectId, roomId }: CanvasStatusBarProps) {
  const updateCanvasStatus = useCanvasStore((s) => s.updateCanvasStatus);
  const addMessage = useChatStore((s) => s.addMessage);
  const room = useRoomStore((s) => s.getRoom(roomId));
  const router = useRouter();
  const [toastVisible, setToastVisible] = useState(false);

  const handleSubmitForReview = () => {
    updateCanvasStatus(canvas.id, "in_review");
    addMessage(
      room?.chatId || "",
      `📋 Canvas **${canvas.title}** has been submitted for review.`,
      "ai-agent",
      "agent",
      "notification"
    );
  };

  const handleApprove = () => {
    updateCanvasStatus(canvas.id, "approved", "user-rishabh");
    setToastVisible(true);

    // Show toast
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);

    // After delay, navigate to chat where agent posts ticket suggestions (Flow 2)
    setTimeout(() => {
      addMessage(
        room?.chatId || "",
        `📋 Canvas **${canvas.title}** was approved by Rishabh.`,
        "ai-agent",
        "agent",
        "notification"
      );
    }, 500);

    setTimeout(() => {
      addMessage(
        room?.chatId || "",
        `🎯 I've analyzed the approved spec **${canvas.title}**. Here are the suggested tickets:\n\n1. **API Implementation** (Backend) — High priority\n2. **UI Component** (Frontend) — High priority, blocked by #1\n3. **Integration Tests** (QA) — Medium priority, blocked by #1 and #2\n\nDependencies: #1 → #2 → #3\n\nShall I create these tickets on the board?`,
        "ai-agent",
        "agent",
        "agent_update",
        [
          { id: "create-all-new", label: "Create All", action: "create_tickets", payload: { canvasId: canvas.id } },
          { id: "edit-new", label: "Edit Before Creating", action: "edit_before_creating" },
          { id: "dismiss-new", label: "Dismiss", action: "dismiss" },
        ]
      );
      router.push(`/project/${projectId}/room/${roomId}/chat`);
    }, 2000);
  };

  return (
    <>
      {/* Toast */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Canvas approved! Specky is analyzing for ticket creation...</span>
        </div>
      )}

      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 flex-1">{canvas.title}</h2>
        <StatusBadge status={canvas.status} />
        {canvas.status === "draft" && (
          <button
            onClick={handleSubmitForReview}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Submit for Review
          </button>
        )}
        {canvas.status === "in_review" && (
          <button
            onClick={handleApprove}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Approve
          </button>
        )}
        {canvas.status === "approved" && canvas.approvedBy && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            Approved by {canvas.approvedBy === "user-rishabh" ? "Rishabh" : canvas.approvedBy}
          </span>
        )}
      </div>
    </>
  );
}
