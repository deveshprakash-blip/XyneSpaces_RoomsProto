"use client";

import { Message } from "@/types";
import { useUserStore } from "@/stores/userStore";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const getUserById = useUserStore((s) => s.getUserById);
  const sender = getUserById(message.senderId);

  if (message.type === "notification") {
    return (
      <div className="flex justify-center py-2">
        <div className="bg-gray-50 text-gray-500 text-xs px-4 py-1.5 rounded-full border border-gray-200">
          {message.content}
        </div>
      </div>
    );
  }

  const isAgent = message.senderType === "agent" && message.type === "agent_update";

  return (
    <div className={cn("flex gap-3 px-6 py-2 group hover:bg-gray-50/50 transition-colors", isAgent && "")}>
      <UserAvatar userId={message.senderId} size="md" className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className={cn("font-semibold text-sm", isAgent ? "text-purple-700" : "text-gray-900")}>
            {message.senderId === "ai-agent" ? "Specky" : sender?.name || message.senderId}
          </span>
          {isAgent && (
            <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">
              AI Agent
            </span>
          )}
          <span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>
        </div>
        <div
          className={cn(
            "mt-1 text-sm leading-relaxed whitespace-pre-wrap",
            isAgent ? "bg-agent-bg border border-agent-border rounded-lg p-3 text-gray-800" : "text-gray-700"
          )}
        >
          {renderContent(message.content)}
        </div>
      </div>
    </div>
  );
}

function renderContent(content: string) {
  // Simple markdown-like rendering
  const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`|```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("```") && part.endsWith("```")) {
      return (
        <pre key={i} className="bg-gray-900 text-green-400 rounded-md p-3 text-xs font-mono my-1 overflow-x-auto">
          {part.slice(3, -3).trim()}
        </pre>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="bg-gray-100 text-pink-600 px-1 py-0.5 rounded text-xs">{part.slice(1, -1)}</code>;
    }
    return <span key={i}>{part}</span>;
  });
}
