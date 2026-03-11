"use client";

import { useState } from "react";
import { X, Search, Link2 } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useBoardStore } from "@/stores/boardStore";
import { useProjectStore } from "@/stores/projectStore";
import { LinkedTicket } from "@/types";

export function LinkTicketModal() {
  const { showLinkTicket, closeLinkTicket, linkTicketSourceId } = useUIStore();
  const searchTickets = useBoardStore((s) => s.searchTickets);
  const linkTickets = useBoardStore((s) => s.linkTickets);
  const getTicket = useBoardStore((s) => s.getTicket);
  const getProject = useProjectStore((s) => s.getProject);

  const [query, setQuery] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [relationship, setRelationship] = useState<LinkedTicket["relationship"]>("related-to");

  if (!showLinkTicket || !linkTicketSourceId) return null;

  const results = query.length >= 1 ? searchTickets(query).filter((t) => t.id !== linkTicketSourceId) : [];
  const sourceTicket = getTicket(linkTicketSourceId);

  const handleLink = () => {
    if (selectedTicketId && linkTicketSourceId) {
      linkTickets(linkTicketSourceId, selectedTicketId, relationship);
      setQuery("");
      setSelectedTicketId(null);
      closeLinkTicket();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={closeLinkTicket} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Link2 className="w-5 h-5" /> Link Ticket
            </h2>
            <button onClick={closeLinkTicket} className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {sourceTicket && (
              <div className="text-sm text-gray-500">
                Linking from: <span className="font-mono text-gray-700">{sourceTicket.displayId}</span> {sourceTicket.title}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ticket ID or title..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                autoFocus
              />
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {results.map((ticket) => {
                  const proj = getProject(ticket.projectId);
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                        selectedTicketId === ticket.id ? "bg-accent/10 border-accent/20" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-400">{ticket.displayId}</span>
                        <span className="text-gray-700 truncate">{ticket.title}</span>
                      </div>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded whitespace-nowrap">
                        {proj?.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {query.length >= 1 && results.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No tickets found</p>
            )}

            {/* Relationship */}
            {selectedTicketId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as LinkedTicket["relationship"])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                >
                  <option value="related-to">Related to</option>
                  <option value="sub-ticket-of">Sub-ticket of</option>
                  <option value="parent-of">Parent of</option>
                  <option value="blocked-by">Blocked by</option>
                  <option value="blocks">Blocks</option>
                  <option value="duplicate-of">Duplicate of</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              onClick={closeLinkTicket}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLink}
              disabled={!selectedTicketId}
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50"
            >
              Link Ticket
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
