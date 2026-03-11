"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useBoardStore } from "@/stores/boardStore";
import { useUserStore } from "@/stores/userStore";
import { NudgeBanner } from "@/components/shared/NudgeBanner";

export function CreateTicketModal() {
  const { showCreateTicket, closeCreateTicket, createTicketDefaults } = useUIStore();
  const addTicket = useBoardStore((s) => s.addTicket);
  const addSubTicket = useBoardStore((s) => s.addSubTicket);
  const getTicket = useBoardStore((s) => s.getTicket);
  const users = useUserStore((s) => s.users);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [type, setType] = useState<"task" | "bug" | "feature" | "sub-task">("task");
  const [tags, setTags] = useState("");
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeText, setNudgeText] = useState("");

  const parentTicket = createTicketDefaults?.parentTicketId
    ? getTicket(createTicketDefaults.parentTicketId)
    : null;

  useEffect(() => {
    if (createTicketDefaults?.parentTicketId) {
      setType("sub-task");
    }
  }, [createTicketDefaults]);

  // Check for cross-team keywords
  useEffect(() => {
    const lower = title.toLowerCase();
    if (lower.includes("marketing") || lower.includes("launch") || lower.includes("assets")) {
      setShowNudge(true);
      setNudgeText("This mentions 'marketing'. Link to a marketing ticket?");
    } else if (lower.includes("design") || lower.includes("ux")) {
      setShowNudge(true);
      setNudgeText("This mentions 'design'. Link to a design ticket?");
    } else {
      setShowNudge(false);
    }
  }, [title]);

  if (!showCreateTicket) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;

    const boardId = createTicketDefaults?.boardId || "board-zhang-paint";
    const roomId = createTicketDefaults?.roomId || "room-zhang-paint";
    const projectId = createTicketDefaults?.projectId || "proj-zhang";

    const newTicket = addTicket({
      title: title.trim(),
      description,
      assignee: assignee || undefined,
      priority,
      type,
      status: createTicketDefaults?.status || "To Do",
      boardId,
      roomId,
      projectId,
      parentTicketId: createTicketDefaults?.parentTicketId,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });

    // If it's a sub-ticket, update parent
    if (createTicketDefaults?.parentTicketId) {
      addSubTicket(createTicketDefaults.parentTicketId, newTicket.id);
    }

    // Reset form
    setTitle("");
    setDescription("");
    setAssignee("");
    setPriority("medium");
    setType("task");
    setTags("");
    closeCreateTicket();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={closeCreateTicket} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {parentTicket ? `Add Sub-ticket of ${parentTicket.displayId}` : "New Ticket"}
            </h2>
            <button onClick={closeCreateTicket} className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cross-project info banner */}
          {parentTicket && parentTicket.projectId !== (createTicketDefaults?.projectId || "proj-zhang") && (
            <div className="mx-6 mt-4">
              <NudgeBanner
                message={`This ticket will be linked as a sub-ticket of ${parentTicket.displayId} (${parentTicket.title}) from a different project.`}
                variant="info"
              />
            </div>
          )}

          {/* AI nudge */}
          {showNudge && (
            <div className="mx-6 mt-4">
              <NudgeBanner
                message={nudgeText}
                variant="suggestion"
                actions={[
                  { label: "Search & Link", onClick: () => {} },
                  { label: "Skip", onClick: () => setShowNudge(false) },
                ]}
              />
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter ticket title..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none"
              />
            </div>

            {/* Row: Assignee + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "critical" | "high" | "medium" | "low")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "task" | "bug" | "feature" | "sub-task")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              >
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="sub-task">Sub-task</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="backend, api, v1 (comma-separated)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              onClick={closeCreateTicket}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50"
            >
              Create Ticket
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
