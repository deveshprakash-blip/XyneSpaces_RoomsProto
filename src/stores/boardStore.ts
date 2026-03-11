import { create } from "zustand";
import { Board, Ticket, LinkedTicket } from "@/types";
import { boards, tickets } from "@/data/seed";
import { generateId } from "@/lib/utils";

interface BoardStore {
  boards: Board[];
  tickets: Ticket[];
  getBoard: (id: string) => Board | undefined;
  getBoardByRoom: (roomId: string) => Board | undefined;
  getTicket: (id: string) => Ticket | undefined;
  getTicketByDisplayId: (displayId: string) => Ticket | undefined;
  getTicketsByBoard: (boardId: string) => Ticket[];
  getTicketsByColumn: (boardId: string, columnName: string) => Ticket[];
  getAllTickets: () => Ticket[];
  moveTicket: (ticketId: string, newStatus: string) => void;
  addTicket: (ticket: Partial<Ticket> & { title: string; boardId: string; roomId: string; projectId: string }) => Ticket;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  linkTickets: (ticketId1: string, ticketId2: string, relationship: LinkedTicket["relationship"]) => void;
  addSubTicket: (parentId: string, childId: string) => void;
  searchTickets: (query: string) => Ticket[];
}

let ticketCounter = 300;

export const useBoardStore = create<BoardStore>((set, get) => ({
  boards: boards,
  tickets: tickets,
  getBoard: (id) => get().boards.find((b) => b.id === id),
  getBoardByRoom: (roomId) => get().boards.find((b) => b.roomId === roomId),
  getTicket: (id) => get().tickets.find((t) => t.id === id),
  getTicketByDisplayId: (displayId) => get().tickets.find((t) => t.displayId === displayId),
  getTicketsByBoard: (boardId) => get().tickets.filter((t) => t.boardId === boardId),
  getTicketsByColumn: (boardId, columnName) => 
    get().tickets.filter((t) => t.boardId === boardId && t.status === columnName),
  getAllTickets: () => get().tickets,
  moveTicket: (ticketId, newStatus) => {
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: newStatus,
              updatedAt: Date.now(),
              completedAt: newStatus === "Done" ? Date.now() : t.completedAt,
              activity: [
                ...t.activity,
                {
                  id: `act-${generateId()}`,
                  content: `Status changed to ${newStatus}`,
                  timestamp: Date.now(),
                  userId: "user-rishabh",
                },
              ],
            }
          : t
      ),
    }));
  },
  addTicket: (partial) => {
    ticketCounter++;
    const newTicket: Ticket = {
      id: `ticket-${generateId()}`,
      displayId: partial.displayId || `DEV-${ticketCounter}`,
      boardId: partial.boardId,
      roomId: partial.roomId,
      projectId: partial.projectId,
      title: partial.title,
      description: partial.description || "",
      status: partial.status || "To Do",
      priority: partial.priority || "medium",
      assignee: partial.assignee,
      reporter: partial.reporter || "user-rishabh",
      type: partial.type || "task",
      parentTicketId: partial.parentTicketId,
      subTicketIds: partial.subTicketIds || [],
      linkedTickets: partial.linkedTickets || [],
      sourceCanvasId: partial.sourceCanvasId,
      sourceCanvasAnchor: partial.sourceCanvasAnchor,
      blockedBy: partial.blockedBy || [],
      blocks: partial.blocks || [],
      tags: partial.tags || [],
      dueDate: partial.dueDate,
      createdBy: partial.createdBy || "user-rishabh",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      activity: [
        {
          id: `act-${generateId()}`,
          content: "Ticket created",
          timestamp: Date.now(),
          userId: "user-rishabh",
        },
      ],
      hasNudge: partial.hasNudge,
      nudgeMessage: partial.nudgeMessage,
    };
    set((s) => ({
      tickets: [...s.tickets, newTicket],
      boards: s.boards.map((b) =>
        b.id === partial.boardId
          ? { ...b, ticketIds: [...b.ticketIds, newTicket.id] }
          : b
      ),
    }));
    return newTicket;
  },
  updateTicket: (ticketId, updates) => {
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === ticketId ? { ...t, ...updates, updatedAt: Date.now() } : t
      ),
    }));
  },
  linkTickets: (ticketId1, ticketId2, relationship) => {
    const t1 = get().getTicket(ticketId1);
    const t2 = get().getTicket(ticketId2);
    if (!t1 || !t2) return;

    const reverseRelationship: Record<string, LinkedTicket["relationship"]> = {
      "related-to": "related-to",
      "sub-ticket-of": "parent-of",
      "parent-of": "sub-ticket-of",
      "blocked-by": "blocks",
      "blocks": "blocked-by",
      "duplicate-of": "duplicate-of",
    };

    const link1: LinkedTicket = {
      ticketId: ticketId2,
      ticketDisplayId: t2.displayId,
      projectId: t2.projectId,
      projectName: "",
      relationship,
      linkedAt: Date.now(),
      linkedBy: "user-rishabh",
    };

    const link2: LinkedTicket = {
      ticketId: ticketId1,
      ticketDisplayId: t1.displayId,
      projectId: t1.projectId,
      projectName: "",
      relationship: reverseRelationship[relationship] || "related-to",
      linkedAt: Date.now(),
      linkedBy: "user-rishabh",
    };

    set((s) => ({
      tickets: s.tickets.map((t) => {
        if (t.id === ticketId1) {
          return { ...t, linkedTickets: [...t.linkedTickets, link1], updatedAt: Date.now() };
        }
        if (t.id === ticketId2) {
          return { ...t, linkedTickets: [...t.linkedTickets, link2], updatedAt: Date.now() };
        }
        return t;
      }),
    }));
  },
  addSubTicket: (parentId, childId) => {
    set((s) => ({
      tickets: s.tickets.map((t) => {
        if (t.id === parentId) {
          return { ...t, subTicketIds: [...t.subTicketIds, childId] };
        }
        if (t.id === childId) {
          return { ...t, parentTicketId: parentId };
        }
        return t;
      }),
    }));
  },
  searchTickets: (query) => {
    const q = query.toLowerCase();
    return get().tickets.filter(
      (t) =>
        t.displayId.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q)
    );
  },
}));
