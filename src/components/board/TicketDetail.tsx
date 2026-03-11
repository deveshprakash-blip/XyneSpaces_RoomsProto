"use client";

import { X, Plus, Link2, GitBranch, ExternalLink, Eye, ChevronRight, CornerLeftUp } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useBoardStore } from "@/stores/boardStore";
import { useUserStore } from "@/stores/userStore";
import { useCanvasStore } from "@/stores/canvasStore";
import { useProjectStore } from "@/stores/projectStore";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { NudgeBanner } from "@/components/shared/NudgeBanner";
import { formatDate, getPriorityColor } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function TicketDetail() {
  const router = useRouter();
  const { selectedTicketId, showTicketDetail, closeTicketDetail, openCreateTicket, openLinkTicket, openFeatureGraph } = useUIStore();
  const getTicket = useBoardStore((s) => s.getTicket);
  const getUserById = useUserStore((s) => s.getUserById);
  const getCanvas = useCanvasStore((s) => s.getCanvas);
  const getProject = useProjectStore((s) => s.getProject);

  if (!showTicketDetail || !selectedTicketId) return null;

  const ticket = getTicket(selectedTicketId);
  if (!ticket) return null;

  const assignee = ticket.assignee ? getUserById(ticket.assignee) : null;
  const reporter = getUserById(ticket.reporter);
  const sourceCanvas = ticket.sourceCanvasId ? getCanvas(ticket.sourceCanvasId) : null;
  const parentTicket = ticket.parentTicketId ? getTicket(ticket.parentTicketId) : null;
  const project = getProject(ticket.projectId);

  const navigateToTicket = (ticketId: string) => {
    const t = getTicket(ticketId);
    if (t) {
      useUIStore.getState().openTicketDetail(ticketId);
      // Navigate to the project/room if different
      router.push(`/project/${t.projectId}/room/${t.roomId}/board`);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={closeTicketDetail} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[600px] bg-white shadow-xl z-50 flex flex-col overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-gray-400">{ticket.displayId}</span>
            <span className="text-gray-300">·</span>
            <h2 className="text-lg font-semibold text-gray-900">{ticket.title}</h2>
          </div>
          <button onClick={closeTicketDetail} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Nudge Banner */}
          {ticket.hasNudge && ticket.nudgeMessage && (
            <div className="px-6 pt-4">
              <NudgeBanner
                message={ticket.nudgeMessage}
                actions={[
                  { label: "Search & Link", onClick: () => openLinkTicket(ticket.id) },
                  { label: "Dismiss", onClick: () => {} },
                ]}
              />
            </div>
          )}

          {/* Meta */}
          <div className="px-6 py-4 grid grid-cols-2 gap-4 border-b border-gray-100">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Status</label>
              <p className="text-sm font-medium text-gray-700 mt-1">{ticket.status}</p>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Priority</label>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(ticket.priority)}`} />
                <span className="text-sm font-medium text-gray-700 capitalize">{ticket.priority}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Assignee</label>
              <div className="flex items-center gap-2 mt-1">
                {assignee ? (
                  <>
                    <UserAvatar userId={assignee.id} size="sm" />
                    <span className="text-sm text-gray-700">{assignee.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Reporter</label>
              <div className="flex items-center gap-2 mt-1">
                {ticket.reporter === "ai-agent" ? (
                  <>
                    <UserAvatar userId="ai-agent" size="sm" />
                    <span className="text-sm text-gray-700">AI Agent</span>
                  </>
                ) : (
                  <>
                    <UserAvatar userId={ticket.reporter} size="sm" />
                    <span className="text-sm text-gray-700">{reporter?.name}</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Type</label>
              <p className="text-sm font-medium text-gray-700 capitalize mt-1">{ticket.type}</p>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Project</label>
              <p className="text-sm font-medium text-gray-700 mt-1">{project?.name}</p>
            </div>
          </div>

          {/* Description */}
          <div className="px-6 py-4 border-b border-gray-100">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Description</label>
            <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {ticket.description || "No description"}
            </div>
          </div>

          {/* Hierarchy */}
          {(parentTicket || ticket.subTicketIds.length > 0) && (
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" /> Hierarchy
                </label>
                <button
                  onClick={() => openFeatureGraph(ticket.id)}
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> View full hierarchy
                </button>
              </div>
              <div className="space-y-1.5 pl-2">
                {parentTicket && (
                  <button
                    onClick={() => navigateToTicket(parentTicket.id)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-accent transition-colors"
                  >
                    <CornerLeftUp className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-mono text-xs text-gray-400">{parentTicket.displayId}</span>
                    <span>{parentTicket.title}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </button>
                )}
                <div className="flex items-center gap-2 text-sm font-medium text-accent pl-4">
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="font-mono text-xs">{ticket.displayId}</span>
                  <span>{ticket.title}</span>
                  <span className="text-[10px] bg-accent/10 px-1.5 py-0.5 rounded">current</span>
                </div>
                {ticket.subTicketIds.map((subId) => {
                  const sub = getTicket(subId);
                  if (!sub) return null;
                  return (
                    <button
                      key={subId}
                      onClick={() => navigateToTicket(subId)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-accent transition-colors pl-8"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-mono text-xs text-gray-400">{sub.displayId}</span>
                      <span>{sub.title}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Linked Tickets */}
          {ticket.linkedTickets.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-100">
              <label className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-3">
                <Link2 className="w-3.5 h-3.5" /> Linked Tickets
              </label>
              <div className="space-y-2">
                {ticket.linkedTickets.map((link, i) => {
                  const linkedProject = getProject(link.projectId);
                  return (
                    <button
                      key={i}
                      onClick={() => navigateToTicket(link.ticketId)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">
                          {link.relationship}
                        </span>
                        <span className="font-mono text-xs text-gray-400">{link.ticketDisplayId}</span>
                        <span className="text-sm text-gray-700">{linkedProject?.name || link.projectName}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {(ticket.blockedBy.length > 0 || ticket.blocks.length > 0) && (
            <div className="px-6 py-4 border-b border-gray-100">
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block">Dependencies</label>
              {ticket.blockedBy.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-red-500 font-medium mb-1">Blocked by:</p>
                  {ticket.blockedBy.map((id) => {
                    const blocker = getTicket(id);
                    return blocker ? (
                      <button
                        key={id}
                        onClick={() => navigateToTicket(id)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-accent ml-2 py-0.5"
                      >
                        <span className="font-mono text-xs text-gray-400">{blocker.displayId}</span>
                        <span>{blocker.title}</span>
                      </button>
                    ) : null;
                  })}
                </div>
              )}
              {ticket.blocks.length > 0 && (
                <div>
                  <p className="text-xs text-amber-500 font-medium mb-1">Blocks:</p>
                  {ticket.blocks.map((id) => {
                    const blocked = getTicket(id);
                    return blocked ? (
                      <button
                        key={id}
                        onClick={() => navigateToTicket(id)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-accent ml-2 py-0.5"
                      >
                        <span className="font-mono text-xs text-gray-400">{blocked.displayId}</span>
                        <span>{blocked.title}</span>
                      </button>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Source */}
          {sourceCanvas && (
            <div className="px-6 py-4 border-b border-gray-100">
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Source</label>
              <button
                onClick={() => {
                  closeTicketDetail();
                  useUIStore.getState().setSelectedCanvas(sourceCanvas.id);
                  router.push(`/project/${ticket.projectId}/room/${ticket.roomId}/canvas`);
                }}
                className="flex items-center gap-2 text-sm text-accent hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Created from: {sourceCanvas.title}
                {ticket.sourceCanvasAnchor && ` · ${ticket.sourceCanvasAnchor}`}
              </button>
            </div>
          )}

          {/* Activity */}
          <div className="px-6 py-4">
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-3 block">Activity</label>
            <div className="space-y-2">
              {ticket.activity.map((act) => (
                <div key={act.id} className="flex items-start gap-2 text-sm">
                  <span className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">{formatDate(act.timestamp)}</span>
                  <span className="text-gray-600">{act.content}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-gray-200 flex gap-2 flex-shrink-0">
          <button
            onClick={() => openCreateTicket({ parentTicketId: ticket.id, boardId: ticket.boardId, roomId: ticket.roomId, projectId: ticket.projectId })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-accent bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Sub-ticket
          </button>
          <button
            onClick={() => openLinkTicket(ticket.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
            Link Ticket
          </button>
        </div>
      </div>
    </>
  );
}
