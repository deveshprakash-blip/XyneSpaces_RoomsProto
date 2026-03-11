"use client";

import { useUserStore } from "@/stores/userStore";

interface MentionDropdownProps {
  query: string;
  onSelect: (name: string) => void;
  visible: boolean;
}

export function MentionDropdown({ query, onSelect, visible }: MentionDropdownProps) {
  const users = useUserStore((s) => s.users);

  if (!visible) return null;

  const options = [
    ...users.map((u) => ({ id: u.id, name: u.name, type: "user" as const })),
    { id: "ai-agent", name: "Specky", type: "agent" as const },
  ].filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));

  if (options.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
      {options.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.name)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
              m.type === "agent" ? "bg-purple-600" : "bg-blue-500"
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
  );
}
