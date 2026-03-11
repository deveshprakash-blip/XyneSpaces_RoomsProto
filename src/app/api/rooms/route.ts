import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

const createRoomSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  type: z.enum(["general", "feature"]),
  contextFilePath: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return errorResponse("VALIDATION_ERROR", "projectId is required", undefined, 400);
    }

    // Verify user has access to project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return errorResponse("NOT_FOUND", "Project not found", undefined, 404);
    }

    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: project.organizationId,
        },
      },
    });

    if (!membership) {
      return errorResponse("FORBIDDEN", "Access denied", undefined, 403);
    }

    const rooms = await prisma.room.findMany({
      where: { projectId },
      include: {
        _count: {
          select: {
            members: true,
            canvases: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(rooms);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const validated = createRoomSchema.parse(body);

    // Verify user has access to project
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
    });

    if (!project) {
      return errorResponse("NOT_FOUND", "Project not found", undefined, 404);
    }

    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: project.organizationId,
        },
      },
    });

    if (!membership || !["owner", "admin", "member"].includes(membership.role)) {
      return errorResponse("FORBIDDEN", "Insufficient permissions", undefined, 403);
    }

    // Create room, chat, and board in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const room = await tx.room.create({
        data: {
          projectId: validated.projectId,
          name: validated.name,
          type: validated.type,
          contextFilePath: validated.contextFilePath,
          createdBy: session.user.id,
        },
      });

      // Create chat for room
      const chat = await tx.chat.create({
        data: {
          roomId: room.id,
        },
      });

      // Create board for room
      const board = await tx.board.create({
        data: {
          roomId: room.id,
          columns: [
            { id: "todo", name: "To Do", order: 0 },
            { id: "in-progress", name: "In Progress", order: 1 },
            { id: "done", name: "Done", order: 2 },
          ],
        },
      });

      // Add creator as room member
      await tx.roomMember.create({
        data: {
          roomId: room.id,
          userId: session.user.id,
          role: "owner",
          addedBy: session.user.id,
        },
      });

      return { room, chat, board };
    });

    return successResponse(result.room);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid input",
        error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
      );
    }
    return handleApiError(error);
  }
}
