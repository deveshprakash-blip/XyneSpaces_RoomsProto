# Product Requirements Document: Multi-User Deployment
## Juspay Collaborative Workspace Platform

**Version:** 1.0  
**Date:** January 2025  
**Status:** Draft  
**Owner:** Product Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Goals & Objectives](#goals--objectives)
4. [User Personas & Stories](#user-personas--stories)
5. [Technical Architecture](#technical-architecture)
6. [Data Models & Database Schema](#data-models--database-schema)
7. [Authentication & Authorization](#authentication--authorization)
8. [API Design](#api-design)
9. [Real-time Collaboration](#real-time-collaboration)
10. [Features & Requirements](#features--requirements)
11. [Deployment & Infrastructure](#deployment--infrastructure)
12. [Security Requirements](#security-requirements)
13. [Performance Requirements](#performance-requirements)
14. [Testing Strategy](#testing-strategy)
15. [Migration Plan](#migration-plan)
16. [Timeline & Milestones](#timeline--milestones)
17. [Success Metrics](#success-metrics)

---

## Executive Summary

### Purpose
Transform the current single-user prototype into a production-ready, multi-tenant collaborative workspace platform that supports:
- Multiple organizations (companies/teams)
- Multiple users per organization
- Real-time collaboration
- Persistent data storage
- Secure authentication and authorization
- Scalable infrastructure

### Problem Statement
The current prototype is a frontend-only application with:
- In-memory state management (Zustand stores)
- Hardcoded seed data
- No user authentication
- No data persistence
- No real-time synchronization
- Single-user experience only

### Solution Overview
Build a full-stack application with:
- PostgreSQL database for persistent storage
- Next.js API routes for backend logic
- NextAuth.js for authentication
- WebSocket/Server-Sent Events for real-time updates
- Multi-tenant architecture with organization isolation
- Role-based access control (RBAC)
- Cloud deployment on Vercel/AWS

### Success Criteria
- Support 100+ concurrent users per organization
- <200ms API response time (p95)
- 99.9% uptime SLA
- Real-time updates with <500ms latency
- Zero data loss on page refresh
- Secure multi-tenant data isolation

---

## Current State Analysis

### Existing Features (Prototype)
✅ **Frontend Components:**
- Project/Room/Chat/Canvas/Board UI
- Ticket management (Kanban board)
- AI agent interactions (simulated)
- Notification system
- User mentions and @ commands
- Canvas approval workflow
- Ticket linking and hierarchy

✅ **State Management:**
- Zustand stores for all entities
- Client-side routing (Next.js App Router)
- Optimistic UI updates

### Gaps & Limitations
❌ **No Backend:**
- All data in browser memory
- No API endpoints
- No server-side validation

❌ **No Database:**
- Seed data in TypeScript files
- Data lost on refresh
- No data relationships enforced

❌ **No Authentication:**
- Single hardcoded user
- No login/signup
- No session management

❌ **No Real-time:**
- No WebSocket connections
- No live collaboration
- No presence indicators

❌ **No Multi-tenancy:**
- No organization concept
- No user management
- No access control

---

## Goals & Objectives

### Primary Goals
1. **Enable Multi-User Collaboration**
   - Multiple users can work simultaneously
   - Real-time updates across all clients
   - Presence indicators (who's online/typing)

2. **Data Persistence**
   - All data stored in PostgreSQL
   - ACID transactions
   - Data backup and recovery

3. **Authentication & Security**
   - Secure user authentication
   - Organization-based access control
   - Role-based permissions

4. **Scalability**
   - Support 1000+ users per organization
   - Horizontal scaling capability
   - Efficient database queries

5. **Production Readiness**
   - Error handling and logging
   - Monitoring and alerting
   - Performance optimization

### Success Metrics
- **User Adoption:** 80% of invited users onboard within 7 days
- **Performance:** <200ms API latency (p95), <500ms real-time update latency
- **Reliability:** 99.9% uptime, <0.1% error rate
- **Security:** Zero data breaches, SOC 2 compliance ready
- **Collaboration:** Average 5+ concurrent users per room

---

## User Personas & Stories

### Persona 1: Organization Admin
**Name:** Priya, Engineering Manager  
**Goals:** Set up workspace, invite team, manage projects  
**Pain Points:** Complex onboarding, unclear permissions

**User Stories:**
- As an admin, I want to create an organization and invite team members
- As an admin, I want to assign roles (owner, admin, member, viewer)
- As an admin, I want to manage project access and permissions
- As an admin, I want to see usage analytics and billing

### Persona 2: Project Owner
**Name:** Rishabh, Product Lead  
**Goals:** Create projects, manage rooms, coordinate work  
**Pain Points:** No visibility into team activity, manual coordination

**User Stories:**
- As a project owner, I want to create projects and rooms
- As a project owner, I want to see all team members' activity
- As a project owner, I want to approve canvases and tickets
- As a project owner, I want to link tickets across projects

### Persona 3: Team Member
**Name:** Ankit, Software Engineer  
**Goals:** Work on tickets, collaborate in chat, update status  
**Pain Points:** Context switching, missing notifications

**User Stories:**
- As a team member, I want to see my assigned tickets
- As a team member, I want to receive real-time notifications
- As a team member, I want to collaborate in chat with @mentions
- As a team member, I want to update ticket status on the board

### Persona 4: Cross-Team Collaborator
**Name:** Sarah, Design Lead  
**Goals:** Work across projects, share designs, coordinate launches  
**Pain Points:** Siloed communication, duplicate work

**User Stories:**
- As a cross-team member, I want to access multiple projects
- As a cross-team member, I want to link tickets across projects
- As a cross-team member, I want to see dependencies and blockers
- As a cross-team member, I want to receive cross-project notifications

---

## Technical Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Next.js │  │  React   │  │ Zustand  │  │ WebSocket│   │
│  │   App    │  │Components│  │  Store   │  │  Client  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  REST API    │  │  WebSocket   │  │  NextAuth.js │      │
│  │  Routes      │  │   Server     │  │  (Auth)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Services   │  │  Validators  │  │  Middleware   │      │
│  │  (Domain)    │  │  (Zod/Joi)   │  │  (RBAC)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Access Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Prisma     │  │   Redis      │  │   S3/R2       │      │
│  │   ORM        │  │  (Cache)     │  │  (Files)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │   Redis      │  │   S3/R2       │      │
│  │  (Primary)   │  │  (Sessions)  │  │  (Storage)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Zustand (client state)
- Tailwind CSS
- Tiptap (rich text editor)
- @hello-pangea/dnd (drag & drop)

**Backend:**
- Next.js API Routes
- NextAuth.js v5 (authentication)
- Prisma ORM (database)
- Zod (validation)
- WebSocket (Socket.io or native)

**Database:**
- PostgreSQL 15+ (primary)
- Redis 7+ (cache, sessions, pub/sub)

**Infrastructure:**
- Vercel (hosting) or AWS (self-hosted)
- Supabase/Neon (managed PostgreSQL)
- Upstash (managed Redis)
- Cloudflare R2 (file storage)

**Monitoring & Observability:**
- Vercel Analytics
- Sentry (error tracking)
- LogRocket (session replay)
- Posthog (product analytics)

---

## Data Models & Database Schema

### Entity Relationship Diagram

```
Organization (1) ──< (N) UserOrganization (membership)
Organization (1) ──< (N) Project
Project (1) ──< (N) Room
Room (1) ──< (1) Chat
Room (1) ──< (1) Board
Room (1) ──< (N) Canvas
Chat (1) ──< (N) Message
Board (1) ──< (N) Ticket
Ticket (N) ──< (N) Ticket (self-referential: parent/child)
Ticket (N) ──< (N) TicketLink (many-to-many)
Canvas (1) ──< (N) CanvasAnnotation
User (1) ──< (N) Notification
```

### Database Schema (Prisma)

```prisma
// User & Authentication
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  avatarUrl     String?
  emailVerified DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  memberships   UserOrganization[]
  messages      Message[]
  tickets       Ticket[]           @relation("Assignee")
  reportedTickets Ticket[]         @relation("Reporter")
  notifications Notification[]
  activities    Activity[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Organization & Multi-tenancy
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  logoUrl     String?
  plan        String   @default("free") // free, pro, enterprise
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members     UserOrganization[]
  projects    Project[]
  settings    OrganizationSettings?
}

model UserOrganization {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  role           String   // owner, admin, member, viewer
  team           String?  // engineering, product, design, etc.
  joinedAt       DateTime @default(now())

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@index([organizationId])
  @@index([userId])
}

model OrganizationSettings {
  id             String   @id @default(cuid())
  organizationId String   @unique
  allowPublicRooms Boolean @default(false)
  requireApproval Boolean @default(true)
  aiAgentEnabled Boolean  @default(true)

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}

// Projects & Rooms
model Project {
  id             String   @id @default(cuid())
  organizationId String
  name           String
  description    String?
  color          String?  // hex color for UI
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  createdBy      String

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  rooms         Room[]
  tickets       Ticket[]
}

model Room {
  id             String   @id @default(cuid())
  projectId      String
  name           String
  type           String   // general, feature
  contextFilePath String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  createdBy      String

  project       Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  members       RoomMember[]
  chat          Chat?
  board         Board?
  canvases      Canvas[]
}

model RoomMember {
  id        String   @id @default(cuid())
  roomId    String
  userId    String
  role      String   @default("member") // owner, member
  addedBy   String
  addedAt   DateTime @default(now())

  room Room @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([roomId, userId])
  @@index([roomId])
  @@index([userId])
}

// Chat & Messages
model Chat {
  id        String   @id @default(cuid())
  roomId    String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  room     Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  messages Message[]
}

model Message {
  id          String   @id @default(cuid())
  chatId      String
  senderId    String
  senderType  String   // human, agent
  type        String   @default("text") // text, notification, agent_update
  content     String   @db.Text
  mentions    String[] // user IDs
  attachments String[] // file URLs
  createdAt   DateTime @default(now())

  chat   Chat @relation(fields: [chatId], references: [id], onDelete: Cascade)
  sender User @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([chatId])
  @@index([createdAt])
  @@index([senderId])
}

// Canvas
model Canvas {
  id             String   @id @default(cuid())
  roomId         String
  title          String
  type           String   // index, doc
  content        String   @db.Text
  status         String   @default("draft") // draft, in_review, approved
  category       String?
  approvedBy     String?
  approvedAt     DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  createdBy      String

  room        Room              @relation(fields: [roomId], references: [id], onDelete: Cascade)
  annotations CanvasAnnotation[]
  tickets     Ticket[]
}

model CanvasAnnotation {
  id        String   @id @default(cuid())
  canvasId  String
  userId    String
  content   String   @db.Text
  position  Json?    // {x, y} or {line, column}
  createdAt DateTime @default(now())

  canvas Canvas @relation(fields: [canvasId], references: [id], onDelete: Cascade)

  @@index([canvasId])
}

// Board & Tickets
model Board {
  id        String   @id @default(cuid())
  roomId    String   @unique
  columns   Json     // Array of {id, name, order}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  room    Room    @relation(fields: [roomId], references: [id], onDelete: Cascade)
  tickets Ticket[]
}

model Ticket {
  id                String   @id @default(cuid())
  displayId         String   // DEV-123
  boardId           String
  roomId            String
  projectId         String
  title             String
  description       String?  @db.Text
  status            String   // To Do, In Progress, Done, etc.
  priority          String   // critical, high, medium, low
  assigneeId        String?
  reporterId        String
  type              String   // task, bug, feature, sub-task
  parentTicketId    String?
  sourceCanvasId    String?
  sourceCanvasAnchor String?
  tags              String[]
  dueDate           DateTime?
  hasNudge          Boolean  @default(false)
  nudgeMessage      String?  @db.Text
  completedAt       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String

  board         Board          @relation(fields: [boardId], references: [id], onDelete: Cascade)
  project       Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee      User?          @relation("Assignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  reporter      User           @relation("Reporter", fields: [reporterId], references: [id], onDelete: Cascade)
  parentTicket  Ticket?        @relation("TicketHierarchy", fields: [parentTicketId], references: [id], onDelete: SetNull)
  subTickets    Ticket[]       @relation("TicketHierarchy")
  sourceCanvas  Canvas?        @relation(fields: [sourceCanvasId], references: [id], onDelete: SetNull)
  links         TicketLink[]   @relation("SourceLinks")
  linkedBy       TicketLink[]   @relation("TargetLinks")
  blockedBy     TicketBlock[]  @relation("BlockedBy")
  blocks        TicketBlock[]  @relation("Blocks")
  activities    Activity[]

  @@unique([boardId, displayId])
  @@index([boardId])
  @@index([status])
  @@index([assigneeId])
  @@index([projectId])
  @@index([parentTicketId])
}

model TicketLink {
  id             String   @id @default(cuid())
  sourceTicketId String
  targetTicketId String
  relationship   String   // related-to, sub-ticket-of, parent-of, blocked-by, blocks, duplicate-of
  linkedAt       DateTime @default(now())
  linkedBy       String

  sourceTicket Ticket @relation("SourceLinks", fields: [sourceTicketId], references: [id], onDelete: Cascade)
  targetTicket Ticket @relation("TargetLinks", fields: [targetTicketId], references: [id], onDelete: Cascade)

  @@unique([sourceTicketId, targetTicketId])
  @@index([sourceTicketId])
  @@index([targetTicketId])
}

model TicketBlock {
  id             String   @id @default(cuid())
  blockerTicketId String
  blockedTicketId String
  createdAt      DateTime @default(now())

  blocker Ticket @relation("BlockedBy", fields: [blockerTicketId], references: [id], onDelete: Cascade)
  blocked Ticket @relation("Blocks", fields: [blockedTicketId], references: [id], onDelete: Cascade)

  @@unique([blockerTicketId, blockedTicketId])
  @@index([blockedTicketId])
}

model Activity {
  id        String   @id @default(cuid())
  ticketId  String?
  userId    String
  content   String
  timestamp DateTime @default(now())

  ticket Ticket? @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([ticketId])
  @@index([timestamp])
}

// Notifications
model Notification {
  id              String   @id @default(cuid())
  userId          String
  type            String   // cross_team_request, ticket_status_change, etc.
  title           String
  body            String   @db.Text
  linkedEntityType String? // ticket, canvas, message
  linkedEntityId  String?
  isRead          Boolean  @default(false)
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([createdAt])
}

// Real-time Presence
model Presence {
  id        String   @id @default(cuid())
  userId    String
  roomId    String?
  status    String   // online, away, offline
  lastSeen  DateTime @default(now())
  metadata  Json?    // {typing: true, cursor: {x, y}}

  @@unique([userId])
  @@index([roomId])
}
```

### Database Indexes Strategy

**High-frequency queries:**
- Messages by chat + timestamp (pagination)
- Tickets by board + status (Kanban view)
- Notifications by user + read status
- Room members by roomId

**Performance optimizations:**
- Composite indexes on foreign keys + filters
- Partial indexes for active/unread records
- JSONB indexes for full-text search (if needed)

---

## Authentication & Authorization

### Authentication Flow

**Provider Options:**
1. **Email/Password** (default)
2. **OAuth Providers:**
   - Google Workspace
   - GitHub
   - Microsoft 365
   - SAML SSO (Enterprise)

**Registration Flow:**
1. User signs up with email
2. Verification email sent
3. User verifies email
4. User creates/joins organization
5. Onboarding wizard (first project setup)

**Login Flow:**
1. User enters email/password or OAuth
2. NextAuth.js validates credentials
3. Session created (JWT or database session)
4. User redirected to workspace
5. Organization context loaded

### Authorization Model (RBAC)

**Organization Roles:**
- **Owner:** Full control, billing, delete org
- **Admin:** Manage members, projects, settings
- **Member:** Create/edit content, invite (if allowed)
- **Viewer:** Read-only access

**Project Permissions:**
- **Owner:** Full control
- **Admin:** Manage rooms, members
- **Member:** Create/edit content
- **Viewer:** Read-only

**Room Permissions:**
- **Owner:** Full control
- **Member:** Create/edit content
- **Viewer:** Read-only

**Resource-Level Permissions:**
- Users can edit their own messages (within time window)
- Users can edit tickets they created/assigned
- Canvas approval requires project admin role
- Cross-project ticket linking requires access to both projects

### Permission Matrix

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| Create Project | ✅ | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ✅ | ❌ | ❌ |
| Create Room | ✅ | ✅ | ✅ | ❌ |
| Delete Room | ✅ | ✅ | ✅ | ❌ |
| Send Message | ✅ | ✅ | ✅ | ✅ |
| Edit Message | ✅ | ✅ | ✅* | ❌ |
| Create Ticket | ✅ | ✅ | ✅ | ❌ |
| Edit Ticket | ✅ | ✅ | ✅* | ❌ |
| Approve Canvas | ✅ | ✅ | ❌ | ❌ |
| Link Tickets | ✅ | ✅ | ✅ | ❌ |
| Invite Members | ✅ | ✅ | ✅** | ❌ |

*Only own/assigned resources  
**If allowed by org settings

---

## API Design

### REST API Endpoints

#### Authentication
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/verify-email
POST   /api/auth/reset-password
GET    /api/auth/session
```

#### Organizations
```
GET    /api/organizations
POST   /api/organizations
GET    /api/organizations/:id
PATCH  /api/organizations/:id
DELETE /api/organizations/:id
GET    /api/organizations/:id/members
POST   /api/organizations/:id/members
DELETE /api/organizations/:id/members/:userId
```

#### Projects
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/rooms
```

#### Rooms
```
GET    /api/rooms
POST   /api/rooms
GET    /api/rooms/:id
PATCH  /api/rooms/:id
DELETE /api/rooms/:id
GET    /api/rooms/:id/members
POST   /api/rooms/:id/members
DELETE /api/rooms/:id/members/:userId
```

#### Chat & Messages
```
GET    /api/rooms/:roomId/chat
GET    /api/rooms/:roomId/chat/messages
POST   /api/rooms/:roomId/chat/messages
PATCH  /api/messages/:id
DELETE /api/messages/:id
```

#### Canvas
```
GET    /api/rooms/:roomId/canvases
POST   /api/rooms/:roomId/canvases
GET    /api/canvases/:id
PATCH  /api/canvases/:id
DELETE /api/canvases/:id
POST   /api/canvases/:id/approve
POST   /api/canvases/:id/annotations
DELETE /api/annotations/:id
```

#### Board & Tickets
```
GET    /api/rooms/:roomId/board
GET    /api/boards/:id/tickets
POST   /api/boards/:id/tickets
GET    /api/tickets/:id
PATCH  /api/tickets/:id
DELETE /api/tickets/:id
POST   /api/tickets/:id/move
POST   /api/tickets/:id/link
DELETE /api/tickets/:id/links/:linkId
GET    /api/tickets/:id/hierarchy
```

#### Notifications
```
GET    /api/notifications
PATCH  /api/notifications/:id/read
POST   /api/notifications/read-all
GET    /api/notifications/unread-count
```

#### Search
```
GET    /api/search?q=query&type=ticket|canvas|message
```

### WebSocket Events

**Connection:**
```typescript
// Client connects to: ws://api.example.com/ws?token=jwt
// Server validates token, adds to room channels
```

**Message Events:**
```typescript
// Client → Server
{
  type: "message:create",
  payload: { chatId, content, mentions }
}

// Server → All clients in room
{
  type: "message:created",
  payload: { message: {...} }
}
```

**Presence Events:**
```typescript
// Client → Server
{
  type: "presence:update",
  payload: { roomId, status: "typing" | "online" | "away" }
}

// Server → All clients in room
{
  type: "presence:updated",
  payload: { userId, status, metadata }
}
```

**Ticket Events:**
```typescript
// Server → All clients in board
{
  type: "ticket:updated",
  payload: { ticket: {...}, changes: {...} }
}

{
  type: "ticket:moved",
  payload: { ticketId, fromStatus, toStatus }
}
```

**Canvas Events:**
```typescript
// Server → All clients viewing canvas
{
  type: "canvas:updated",
  payload: { canvasId, content, updatedBy }
}
```

### API Response Format

**Success:**
```json
{
  "success": true,
  "data": {...},
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## Real-time Collaboration

### WebSocket Architecture

**Technology:** Socket.io or native WebSocket with reconnection

**Connection Management:**
- JWT token in query string for auth
- Room-based channels (subscribe to room IDs)
- Automatic reconnection with exponential backoff
- Heartbeat/ping to detect disconnections

**Message Broadcasting:**
- Redis Pub/Sub for multi-server scaling
- Channel pattern: `room:{roomId}`, `board:{boardId}`, `canvas:{canvasId}`
- Server publishes to Redis, all instances subscribe

**Presence System:**
- Track user online/offline status
- Track typing indicators per room
- Track cursor positions (optional, for canvas)
- Cleanup on disconnect (30s grace period)

### Operational Transform (OT) for Canvas

**For collaborative editing:**
- Use Yjs or ShareJS for conflict-free editing
- Yjs CRDT (Conflict-free Replicated Data Type)
- WebSocket for sync, IndexedDB for offline

**Implementation:**
- Tiptap + Yjs integration
- Yjs provider over WebSocket
- Automatic conflict resolution
- Offline support with sync on reconnect

### Optimistic Updates

**Strategy:**
1. Update UI immediately (optimistic)
2. Send request to server
3. On success: confirm update
4. On error: rollback + show error

**Conflict Resolution:**
- Server timestamp wins
- Last-write-wins for simple fields
- OT/CRDT for complex (canvas content)

---

## Features & Requirements

### Core Features (MVP)

#### 1. User Onboarding
- **Sign up flow:** Email verification, password setup
- **Organization creation:** Name, slug, initial project
- **Invite flow:** Email invites, role assignment
- **Welcome wizard:** First project setup, team invite

#### 2. Multi-User Chat
- Real-time message delivery
- @mentions with autocomplete
- Typing indicators
- Message reactions (optional)
- File attachments
- Message search

#### 3. Collaborative Canvas
- Real-time collaborative editing (Yjs)
- Version history
- Comments/annotations
- Approval workflow
- Export to PDF/Markdown

#### 4. Kanban Board
- Real-time drag & drop
- Multiple assignees (optional)
- Custom columns
- Filters and views
- Bulk operations

#### 5. Ticket Management
- Create/edit/delete tickets
- Status transitions
- Priority and tags
- Dependencies (blocked by/blocks)
- Cross-project linking
- Activity timeline

#### 6. Notifications
- Real-time push notifications
- In-app notification center
- Email digests (daily/weekly)
- Notification preferences

#### 7. AI Agent Integration
- Context-aware suggestions
- Ticket generation from canvas
- Cross-team coordination nudges
- Automated summaries

### Advanced Features (Post-MVP)

- **Advanced Search:** Full-text search across all content
- **Analytics Dashboard:** Project velocity, team metrics
- **Integrations:** GitHub, Jira, Slack, Linear
- **Custom Fields:** Project-specific ticket fields
- **Templates:** Project/room templates
- **Export/Import:** Data export, backup/restore
- **Mobile App:** React Native app
- **API Access:** Public API for integrations

---

## Deployment & Infrastructure

### Infrastructure Architecture

**Production Setup:**
```
┌─────────────────────────────────────────┐
│         Cloudflare CDN                 │
│    (Static assets, DDoS protection)     │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Vercel Edge Network             │
│    (Next.js App, API Routes)            │
│    - Auto-scaling                       │
│    - Edge functions                     │
│    - Zero-downtime deployments          │
└─────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐   ┌──────────────┐
│  Supabase    │   │   Upstash     │
│  PostgreSQL  │   │   Redis       │
│  (Primary)   │   │   (Cache)     │
└──────────────┘   └──────────────┘
        │
        ▼
┌──────────────┐
│  Cloudflare  │
│  R2 Storage  │
│  (Files)     │
└──────────────┘
```

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." # For migrations

# Redis
REDIS_URL="redis://..."
REDIS_TOKEN="..."

# Authentication
NEXTAUTH_URL="https://app.example.com"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Storage
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."

# Monitoring
SENTRY_DSN="..."
LOGROCKET_ID="..."
POSTHOG_KEY="..."

# AI (if applicable)
OPENAI_API_KEY="..."
```

### Deployment Strategy

**CI/CD Pipeline:**
1. **GitHub Actions:**
   - Run tests (unit, integration)
   - Lint and type-check
   - Build Docker image (if self-hosted)
   - Deploy to staging

2. **Vercel:**
   - Auto-deploy on merge to `main`
   - Preview deployments for PRs
   - Zero-downtime deployments
   - Automatic rollback on errors

3. **Database Migrations:**
   - Prisma migrations run automatically
   - Backup before migration
   - Rollback plan ready

**Staging Environment:**
- Separate Vercel project
- Separate database (Supabase staging)
- Test data seeded
- Access restricted to team

**Production Environment:**
- Production Vercel project
- Production database (backed up daily)
- Monitoring and alerting enabled
- Rate limiting enabled

### Scaling Strategy

**Horizontal Scaling:**
- Vercel auto-scales Next.js instances
- PostgreSQL read replicas for read-heavy queries
- Redis cluster for high availability
- CDN for static assets

**Database Optimization:**
- Connection pooling (PgBouncer)
- Query optimization (indexes, EXPLAIN ANALYZE)
- Read replicas for analytics
- Partitioning for large tables (messages, activities)

**Caching Strategy:**
- Redis cache for frequently accessed data
- API response caching (Next.js ISR)
- Browser caching for static assets
- CDN edge caching

---

## Security Requirements

### Data Security

**Encryption:**
- TLS 1.3 for all connections
- Database encryption at rest
- Encrypted backups
- Secrets in environment variables (never committed)

**Data Isolation:**
- Row-level security (RLS) in PostgreSQL
- Organization-based data filtering
- No cross-organization data leaks
- Audit logs for sensitive operations

**Input Validation:**
- Zod schemas for all API inputs
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React auto-escaping, CSP headers)
- CSRF protection (NextAuth.js built-in)

### Authentication Security

**Password Security:**
- Bcrypt hashing (12+ rounds)
- Password strength requirements
- Rate limiting on login attempts
- Account lockout after failed attempts

**Session Security:**
- HttpOnly, Secure cookies
- JWT expiration (7 days, refresh tokens)
- Session invalidation on logout
- Device tracking (optional)

**OAuth Security:**
- PKCE flow for OAuth
- State parameter validation
- Token storage in secure cookies
- Scope minimization

### Authorization Security

**Access Control:**
- Server-side permission checks (never trust client)
- Role-based access control (RBAC)
- Resource-level permissions
- Audit trail for permission changes

**API Security:**
- Rate limiting (100 req/min per user)
- Request size limits (10MB max)
- CORS configuration
- API key authentication for integrations

### Compliance

**GDPR:**
- Data export functionality
- Data deletion (right to be forgotten)
- Privacy policy and terms
- Cookie consent (if applicable)

**SOC 2 (Future):**
- Security controls documentation
- Regular security audits
- Incident response plan
- Vendor risk management

---

## Performance Requirements

### Response Time Targets

**API Endpoints:**
- GET requests: <200ms (p95)
- POST/PATCH requests: <500ms (p95)
- Complex queries: <1s (p95)

**Page Load:**
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Largest Contentful Paint: <2.5s

**Real-time Updates:**
- WebSocket message delivery: <500ms
- Presence updates: <1s
- Typing indicators: <200ms

### Throughput Targets

- **Concurrent Users:** 1000+ per organization
- **API Requests:** 10,000 req/min
- **WebSocket Connections:** 5000 concurrent
- **Database Queries:** 50,000 queries/min

### Optimization Strategies

**Frontend:**
- Code splitting (route-based, component-based)
- Image optimization (Next.js Image)
- Lazy loading (components, routes)
- Memoization (React.memo, useMemo)
- Virtual scrolling for long lists

**Backend:**
- Database query optimization
- Connection pooling
- Response caching
- Background job processing (for heavy tasks)

**Database:**
- Proper indexing
- Query optimization
- Connection pooling
- Read replicas for analytics

---

## Testing Strategy

### Unit Tests

**Coverage Target:** 80%+

**Test Areas:**
- Business logic functions
- Utility functions
- Data transformations
- Validation schemas (Zod)

**Tools:**
- Jest
- React Testing Library
- @testing-library/user-event

### Integration Tests

**Test Areas:**
- API endpoints (full request/response)
- Database operations (Prisma)
- Authentication flows
- Permission checks

**Tools:**
- Jest + Supertest
- Test database (separate from prod)
- Test data factories

### E2E Tests

**Test Areas:**
- Critical user flows:
  - Sign up → Create project → Create ticket
  - Real-time message delivery
  - Canvas collaboration
  - Ticket drag & drop

**Tools:**
- Playwright or Cypress
- Test environment (staging)

### Performance Tests

**Test Areas:**
- API load testing
- Database query performance
- WebSocket connection limits
- Concurrent user simulation

**Tools:**
- k6 or Artillery
- Load testing environment

### Security Tests

**Test Areas:**
- Authentication bypass attempts
- Authorization checks
- SQL injection attempts
- XSS attempts
- CSRF protection

**Tools:**
- OWASP ZAP
- Manual penetration testing

---

## Migration Plan

### Phase 1: Database Setup (Week 1-2)

1. **Set up PostgreSQL:**
   - Create Supabase/Neon account
   - Set up production database
   - Set up staging database

2. **Prisma Setup:**
   - Initialize Prisma
   - Create schema (from design above)
   - Generate migrations
   - Run migrations on staging

3. **Seed Data Migration:**
   - Write migration script
   - Convert seed.ts to SQL/Prisma
   - Test on staging

### Phase 2: Authentication (Week 3-4)

1. **NextAuth.js Setup:**
   - Install and configure
   - Set up email provider
   - Set up OAuth providers (Google, GitHub)
   - Create login/signup pages

2. **User Management:**
   - User registration flow
   - Email verification
   - Password reset
   - Profile management

### Phase 3: API Development (Week 5-8)

1. **Core APIs:**
   - Organizations API
   - Projects API
   - Rooms API
   - Chat/Messages API

2. **Advanced APIs:**
   - Canvas API
   - Board/Tickets API
   - Notifications API
   - Search API

3. **Middleware:**
   - Authentication middleware
   - Authorization middleware
   - Error handling
   - Request validation

### Phase 4: Real-time (Week 9-10)

1. **WebSocket Setup:**
   - Socket.io or native WebSocket
   - Redis Pub/Sub
   - Connection management
   - Presence system

2. **Real-time Features:**
   - Message broadcasting
   - Ticket updates
   - Canvas collaboration (Yjs)
   - Typing indicators

### Phase 5: Frontend Integration (Week 11-12)

1. **Replace Zustand with API calls:**
   - Create API client hooks
   - Replace store calls with API calls
   - Add loading/error states
   - Optimistic updates

2. **Real-time Integration:**
   - WebSocket client setup
   - Subscribe to room channels
   - Handle real-time events
   - Update UI on events

### Phase 6: Testing & Deployment (Week 13-14)

1. **Testing:**
   - Write unit tests
   - Write integration tests
   - Write E2E tests
   - Performance testing

2. **Deployment:**
   - Set up Vercel production
   - Configure environment variables
   - Set up monitoring
   - Deploy to production

3. **Migration:**
   - Data migration from prototype (if needed)
   - User onboarding
   - Documentation

---

## Timeline & Milestones

### Milestone 1: Database & Auth (Week 4)
- ✅ PostgreSQL set up
- ✅ Prisma schema complete
- ✅ NextAuth.js integrated
- ✅ User registration working

### Milestone 2: Core APIs (Week 8)
- ✅ All REST APIs implemented
- ✅ Authentication/authorization working
- ✅ Basic CRUD operations tested

### Milestone 3: Real-time (Week 10)
- ✅ WebSocket server running
- ✅ Real-time messages working
- ✅ Presence system working

### Milestone 4: Frontend Integration (Week 12)
- ✅ All API calls integrated
- ✅ Real-time updates working
- ✅ UI fully functional

### Milestone 5: Production Ready (Week 14)
- ✅ All tests passing
- ✅ Performance optimized
- ✅ Deployed to production
- ✅ Monitoring active

---

## Success Metrics

### User Metrics
- **Active Users:** 100+ within 30 days
- **Daily Active Users (DAU):** 50+ within 30 days
- **User Retention:** 60% week-over-week
- **Onboarding Completion:** 80% of signups

### Engagement Metrics
- **Messages per Day:** 500+ within 30 days
- **Tickets Created:** 200+ within 30 days
- **Canvas Edits:** 100+ within 30 days
- **Average Session Duration:** 15+ minutes

### Technical Metrics
- **API Uptime:** 99.9%
- **API Latency:** <200ms (p95)
- **Error Rate:** <0.1%
- **Real-time Latency:** <500ms

### Business Metrics
- **Organizations Created:** 20+ within 30 days
- **Projects per Organization:** 3+ average
- **Team Size:** 5+ members per organization average

---

## Appendix

### A. Technology Decisions

**Why Next.js?**
- Full-stack framework (API routes)
- Server-side rendering (SEO, performance)
- Excellent developer experience
- Vercel deployment (zero config)

**Why PostgreSQL?**
- ACID compliance
- Rich data types (JSON, arrays)
- Excellent performance
- Strong ecosystem (Prisma, Supabase)

**Why Prisma?**
- Type-safe database access
- Excellent migration system
- Great developer experience
- Active community

**Why NextAuth.js?**
- Built for Next.js
- Multiple provider support
- Secure by default
- Active maintenance

**Why Socket.io?**
- Automatic reconnection
- Room/channel support
- Fallback to polling
- Mature and stable

### B. Open Questions

1. **AI Agent:** Real AI integration or simulated? (Cost, latency)
2. **File Storage:** S3, R2, or Supabase Storage?
3. **Email Service:** SendGrid, Resend, or Postmark?
4. **Analytics:** Posthog, Mixpanel, or custom?
5. **Monitoring:** Vercel Analytics + Sentry sufficient?

### C. Future Considerations

- **Mobile Apps:** React Native or PWA?
- **Offline Support:** Service workers, IndexedDB
- **Internationalization:** i18n support
- **White-label:** Custom branding per organization
- **Enterprise Features:** SSO, advanced permissions, audit logs

---

**Document Status:** Draft  
**Last Updated:** January 2025  
**Next Review:** After Phase 1 completion
