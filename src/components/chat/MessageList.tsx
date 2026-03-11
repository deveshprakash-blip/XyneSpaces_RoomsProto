"use client";

import { useEffect, useRef, useMemo } from "react";
import { useChatStore } from "@/stores/chatStore";
import { MessageBubble } from "./MessageBubble";
import { AgentMessage } from "./AgentMessage";

interface MessageListProps {
  chatId: string;
  projectId: string;
  roomId: string;
}

export function MessageList({ chatId, projectId, roomId }: MessageListProps) {
  const allMessages = useChatStore((s) => s.messages);
  const messages = useMemo(
    () => allMessages.filter((m) => m.chatId === chatId),
    [allMessages, chatId]
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto py-4">
      {messages.map((msg) => {
        if (msg.senderType === "agent" && msg.type === "agent_update" && msg.actionButtons?.length) {
          return (
            <AgentMessage
              key={msg.id}
              message={msg}
              projectId={projectId}
              roomId={roomId}
            />
          );
        }
        return <MessageBubble key={msg.id} message={msg} />;
      })}
      <div ref={bottomRef} />
    </div>
  );
}
