import { create } from "zustand";
import { Ticket } from "@/types";

interface UIStore {
  selectedProjectId: string | null;
  selectedRoomId: string | null;
  activeTab: "chat" | "canvas" | "board";
  selectedCanvasId: string | null;
  selectedTicketId: string | null;
  showTicketDetail: boolean;
  showCreateTicket: boolean;
  showLinkTicket: boolean;
  showNotifications: boolean;
  showFeatureGraph: boolean;
  createTicketDefaults: Partial<Ticket> | null;
  linkTicketSourceId: string | null;
  sidebarCollapsed: boolean;

  setSelectedProject: (id: string) => void;
  setSelectedRoom: (id: string) => void;
  setActiveTab: (tab: "chat" | "canvas" | "board") => void;
  setSelectedCanvas: (id: string | null) => void;
  openTicketDetail: (id: string) => void;
  closeTicketDetail: () => void;
  openCreateTicket: (defaults?: Partial<Ticket>) => void;
  closeCreateTicket: () => void;
  openLinkTicket: (sourceId: string) => void;
  closeLinkTicket: () => void;
  toggleNotifications: () => void;
  openFeatureGraph: (ticketId: string) => void;
  closeFeatureGraph: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedProjectId: null,
  selectedRoomId: null,
  activeTab: "chat",
  selectedCanvasId: null,
  selectedTicketId: null,
  showTicketDetail: false,
  showCreateTicket: false,
  showLinkTicket: false,
  showNotifications: false,
  showFeatureGraph: false,
  createTicketDefaults: null,
  linkTicketSourceId: null,
  sidebarCollapsed: false,

  setSelectedProject: (id) => set({ selectedProjectId: id }),
  setSelectedRoom: (id) => set({ selectedRoomId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCanvas: (id) => set({ selectedCanvasId: id }),
  openTicketDetail: (id) => set({ selectedTicketId: id, showTicketDetail: true }),
  closeTicketDetail: () => set({ showTicketDetail: false, selectedTicketId: null }),
  openCreateTicket: (defaults) => set({ showCreateTicket: true, createTicketDefaults: defaults || null }),
  closeCreateTicket: () => set({ showCreateTicket: false, createTicketDefaults: null }),
  openLinkTicket: (sourceId) => set({ showLinkTicket: true, linkTicketSourceId: sourceId }),
  closeLinkTicket: () => set({ showLinkTicket: false, linkTicketSourceId: null }),
  toggleNotifications: () => set((s) => ({ showNotifications: !s.showNotifications })),
  openFeatureGraph: (ticketId) => set({ showFeatureGraph: true, selectedTicketId: ticketId }),
  closeFeatureGraph: () => set({ showFeatureGraph: false }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
