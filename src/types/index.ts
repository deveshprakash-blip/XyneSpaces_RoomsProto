// ============================================
// Juspay Collaborative Workspace - Type Definitions
// ============================================

export type Timestamp = number; // Date.now()

// --- Project ---
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: ProjectMember[];
  roomIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member" | "guest";
  team: "bd" | "product" | "design" | "dev" | "marketing" | "other";
  joinedAt: Timestamp;
}

// --- Room ---
export interface Room {
  id: string;
  projectId: string;
  name: string;
  type: "general" | "feature";
  contextFilePath: string;
  members: RoomMember[];
  chatId: string;
  canvasIds: string[];
  boardId: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RoomMember {
  userId: string;
  role: "owner" | "member" | "guest";
  addedBy: string;
  addedAt: Timestamp;
}

// --- Chat ---
export interface Chat {
  id: string;
  roomId: string;
  messageIds: string[];
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderType: "human" | "agent";
  type: "text" | "voice_note" | "huddle_transcript" | "agent_update" | "notification";
  content: string;
  mentions: Mention[];
  attachments: Attachment[];
  replyTo?: string;
  actionButtons?: ActionButton[];
  createdAt: Timestamp;
}

export interface ActionButton {
  id: string;
  label: string;
  action: "navigate_board" | "navigate_canvas" | "create_tickets" | "link_ticket" | "dismiss" | "notify_pocs" | "view_unlinked" | "edit_before_creating";
  payload?: Record<string, string | number | boolean>;
}

export interface Mention {
  type: "user" | "agent" | "ticket" | "canvas";
  targetId: string;
  displayName: string;
}

export interface Attachment {
  id: string;
  type: "image" | "file" | "preview_link" | "ticket_card";
  url: string;
  metadata?: Record<string, string | number | boolean>;
}

// --- Canvas ---
export interface Canvas {
  id: string;
  roomId: string;
  title: string;
  type: "index" | "doc";
  content: string;
  status: "draft" | "in_review" | "approved" | "archived";
  approvedBy?: string;
  approvedAt?: Timestamp;
  linkedTickets: string[];
  annotations: CanvasAnnotation[];
  category?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CanvasAnnotation {
  id: string;
  canvasId: string;
  type: "ticket_reference" | "ai_suggestion" | "human_comment" | "nudge";
  anchorText: string;
  anchorStartOffset: number;
  anchorEndOffset: number;
  content: string;
  linkedTicketId?: string;
  createdBy: string;
  createdAt: Timestamp;
}

// --- Board ---
export interface Board {
  id: string;
  roomId: string;
  columns: BoardColumn[];
  ticketIds: string[];
}

export interface BoardColumn {
  id: string;
  name: string;
  order: number;
}

export interface Ticket {
  id: string;
  displayId: string;
  boardId: string;
  roomId: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: "critical" | "high" | "medium" | "low";
  assignee?: string;
  reporter: string;
  type: "task" | "bug" | "feature" | "sub-task";
  parentTicketId?: string;
  subTicketIds: string[];
  linkedTickets: LinkedTicket[];
  sourceCanvasId?: string;
  sourceCanvasAnchor?: string;
  blockedBy: string[];
  blocks: string[];
  tags: string[];
  dueDate?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  activity: ActivityEntry[];
  hasNudge?: boolean;
  nudgeMessage?: string;
}

export interface LinkedTicket {
  ticketId: string;
  ticketDisplayId: string;
  projectId: string;
  projectName: string;
  relationship: "related-to" | "sub-ticket-of" | "parent-of" | "blocked-by" | "blocks" | "duplicate-of";
  linkedAt: Timestamp;
  linkedBy: string;
}

export interface ActivityEntry {
  id: string;
  content: string;
  timestamp: Timestamp;
  userId?: string;
}

// --- Notification ---
export interface Notification {
  id: string;
  recipientUserId: string;
  recipientRole?: string;
  type:
    | "cross_team_request"
    | "ticket_status_change"
    | "dependency_unblocked"
    | "linking_nudge"
    | "approval_request"
    | "agent_update"
    | "mention";
  title: string;
  body: string;
  isRead: boolean;
  actionButtons?: ActionButton[];
  linkedEntityId?: string;
  linkedEntityType?: "ticket" | "canvas" | "room" | "project";
  createdAt: Timestamp;
}

// --- User ---
export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  team: "bd" | "product" | "design" | "dev" | "marketing" | "other";
}

// --- UI State ---
export interface UIState {
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
  createTicketDefaults?: Partial<Ticket>;
  linkTicketSourceId?: string;
}

export const DEFAULT_COLUMNS: BoardColumn[] = [
  { id: "col-todo", name: "To Do", order: 0 },
  { id: "col-solutioning", name: "Solutioning", order: 1 },
  { id: "col-design", name: "Design In Progress", order: 2 },
  { id: "col-dev", name: "Dev In Progress", order: 3 },
  { id: "col-review", name: "Review", order: 4 },
  { id: "col-done", name: "Done", order: 5 },
];
