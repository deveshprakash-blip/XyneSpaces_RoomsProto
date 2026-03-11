"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Mic, Paperclip } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useUserStore } from "@/stores/userStore";
import { useCanvasStore } from "@/stores/canvasStore";

interface MessageInputProps {
  chatId: string;
  roomId: string;
  projectId?: string;
}

export function MessageInput({ chatId, roomId }: MessageInputProps) {
  const [value, setValue] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const addMessage = useChatStore((s) => s.addMessage);
  const users = useUserStore((s) => s.users);
  const addCanvas = useCanvasStore((s) => s.addCanvas);
  

  const mentionOptions = [
    ...users.map((u) => ({ id: u.id, name: u.name, type: "user" as const })),
    { id: "ai-agent", name: "Specky", type: "agent" as const },
  ];

  const filteredMentions = mentionOptions.filter((m) =>
    m.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (val: string) => {
    setValue(val);
    const lastAt = val.lastIndexOf("@");
    if (lastAt >= 0 && (lastAt === 0 || val[lastAt - 1] === " ")) {
      const after = val.slice(lastAt + 1);
      if (!after.includes(" ")) {
        setShowMentions(true);
        setMentionQuery(after);
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (name: string) => {
    const lastAt = value.lastIndexOf("@");
    const before = value.slice(0, lastAt);
    setValue(`${before}@${name} `);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;

    addMessage(chatId, trimmed, "user-rishabh", "human");
    setValue("");

    // Check for @Specky interactions
    if (trimmed.toLowerCase().includes("@specky")) {
      // Simulate typing delay
      setTimeout(() => {
        if (trimmed.toLowerCase().includes("create a spec") || trimmed.toLowerCase().includes("create spec")) {
          // Flow 1: Create spec from discussion
          const newCanvas = addCanvas(
            roomId,
            "New Spec Document",
            "# New Spec Document\n\nGenerated from chat discussion.\n\n## Overview\n\nThis document captures the key decisions and requirements discussed in chat.\n\n## Requirements\n\n- Requirement 1\n- Requirement 2\n\n## Technical Decisions\n\n- Decision 1\n- Decision 2",
            "doc",
            "Engineering"
          );
          addMessage(
            chatId,
            `✅ I've created **New Spec Document** canvas from the recent discussion. It covers the key topics and decisions mentioned.`,
            "ai-agent",
            "agent",
            "agent_update",
            [
              {
                id: "view-new-canvas",
                label: "View Canvas →",
                action: "navigate_canvas",
                payload: { canvasId: newCanvas.id },
              },
            ]
          );
        } else if (trimmed.toLowerCase().includes("summarize") || trimmed.toLowerCase().includes("summary")) {
          addMessage(
            chatId,
            `📝 **Discussion Summary:**\n\nKey points from this conversation:\n\n1. **Architecture**: Client-heavy with periodic server sync\n2. **Rendering**: Canvas2D API with optimistic updates\n3. **Persistence**: Debounced auto-save (2s) + explicit save\n4. **Undo/Redo**: Command pattern with 100-item stack\n\nWant me to create a canvas doc from this summary?`,
            "ai-agent",
            "agent",
            "agent_update",
            [
              { id: "create-from-summary", label: "Create Canvas Doc", action: "navigate_canvas" },
              { id: "dismiss-summary", label: "Dismiss", action: "dismiss" },
            ]
          );
        } else {
          addMessage(
            chatId,
            `I'm here to help! I can:\n\n• **Create a spec doc** from your discussion\n• **Summarize** the conversation\n• **Generate tickets** from an approved canvas\n• **Suggest links** between related tickets\n\nJust let me know what you need!`,
            "ai-agent",
            "agent",
            "agent_update"
          );
        }
      }, 1500);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0 relative">
      {/* Mention dropdown */}
      {showMentions && filteredMentions.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
          {filteredMentions.map((m) => (
            <button
              key={m.id}
              onClick={() => insertMention(m.name)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                  m.type === "agent" ? "bg-purple-600" : "bg-accent"
                }`}
              >
                {m.type === "agent" ? "🤖" : m.name[0]}
              </div>
              <span className="font-medium">{m.name}</span>
              {m.type === "agent" && (
                <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">AI</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (use @ to mention)"
            className="w-full resize-none border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent min-h-[40px] max-h-32"
            rows={1}
          />
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            className="p-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
