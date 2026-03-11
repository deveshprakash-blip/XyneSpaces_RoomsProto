"use client";

import { X } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useBoardStore } from "@/stores/boardStore";
import { useProjectStore } from "@/stores/projectStore";
import { Ticket } from "@/types";

const projectColors: Record<string, string> = {
  "proj-zhang": "#3b82f6",
  "proj-swiggy": "#10b981",
};

export function FeatureGraphModal() {
  const { showFeatureGraph, closeFeatureGraph, selectedTicketId, openTicketDetail } = useUIStore();
  const getTicket = useBoardStore((s) => s.getTicket);
  const getProject = useProjectStore((s) => s.getProject);

  if (!showFeatureGraph || !selectedTicketId) return null;

  const ticket = getTicket(selectedTicketId);
  if (!ticket) return null;

  // Collect all related tickets
  const relatedTickets = new Map<string, Ticket>();
  const collectRelated = (t: Ticket, depth: number) => {
    if (relatedTickets.has(t.id) || depth > 5) return;
    relatedTickets.set(t.id, t);

    // Parent
    if (t.parentTicketId) {
      const parent = getTicket(t.parentTicketId);
      if (parent) collectRelated(parent, depth + 1);
    }

    // Sub-tickets
    t.subTicketIds.forEach((id) => {
      const sub = getTicket(id);
      if (sub) collectRelated(sub, depth + 1);
    });

    // Linked
    t.linkedTickets.forEach((link) => {
      const linked = getTicket(link.ticketId);
      if (linked) collectRelated(linked, depth + 1);
    });

    // Blocked by / blocks
    [...t.blockedBy, ...t.blocks].forEach((id) => {
      const dep = getTicket(id);
      if (dep) collectRelated(dep, depth + 1);
    });
  };

  collectRelated(ticket, 0);
  const nodes = Array.from(relatedTickets.values());

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={closeFeatureGraph} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[70vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Feature Hierarchy</h2>
            <button onClick={closeFeatureGraph} className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Graph */}
          <div className="flex-1 overflow-auto p-6">
            {/* Legend */}
            <div className="flex gap-4 mb-6">
              {Array.from(new Set(nodes.map((n) => n.projectId))).map((pid) => {
                const proj = getProject(pid);
                return (
                  <div key={pid} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: projectColors[pid] || "#6b7280" }} />
                    {proj?.name || pid}
                  </div>
                );
              })}
            </div>

            {/* Tree visualization */}
            <div className="space-y-2">
              {nodes.map((node) => {
                const proj = getProject(node.projectId);
                const color = projectColors[node.projectId] || "#6b7280";
                const isCurrent = node.id === selectedTicketId;

                return (
                  <button
                    key={node.id}
                    onClick={() => {
                      closeFeatureGraph();
                      openTicketDetail(node.id);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                      isCurrent
                        ? "border-accent bg-accent/5"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-400">{node.displayId}</span>
                        <span className="text-sm font-medium text-gray-800 truncate">{node.title}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-accent text-white px-1.5 py-0.5 rounded">current</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">{proj?.name}</span>
                        <span className="text-[10px] text-gray-400">·</span>
                        <span className="text-[10px] text-gray-400">{node.status}</span>
                        {node.blockedBy.length > 0 && (
                          <span className="text-[10px] text-red-400">blocked</span>
                        )}
                      </div>
                    </div>
                    {/* Connections summary */}
                    <div className="flex gap-1 flex-shrink-0">
                      {node.subTicketIds.length > 0 && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          {node.subTicketIds.length} sub
                        </span>
                      )}
                      {node.linkedTickets.length > 0 && (
                        <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">
                          {node.linkedTickets.length} links
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
