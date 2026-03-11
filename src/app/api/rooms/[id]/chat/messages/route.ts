import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

const createMessageSchema = z.object({
  content: z.string().min(1),
  type: z.enum(["text", "notification", "agent_update"]).optional(),
  mentions: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const cursor = searchParams.get("cursor");

    // Verify user has access to room
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    });

    if (!room) {
      return errorResponse("NOT_FOUND", "Room not found", undefined, 404);
    }

    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: room.project.organizationId,
        },
      },
    });

    if (!membership) {
      return errorResponse("FORBIDDEN", "Access denied", undefined, 403);
    }

    // Get chat for room
    const chat = await prisma.chat.findUnique({
      where: { roomId: params.id },
    });

    if (!chat) {
      return successResponse([]);
    }

    const where: any = { chatId: chat.id };
    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return successResponse(messages.reverse()); // Reverse to get chronological order
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const validated = createMessageSchema.parse(body);

    // Verify user has access to room
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    });

    if (!room) {
      return errorResponse("NOT_FOUND", "Room not found", undefined, 404);
    }

    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: room.project.organizationId,
        },
      },
    });

    if (!membership) {
      return errorResponse("FORBIDDEN", "Access denied", undefined, 403);
    }

    // Get or create chat
    let chat = await prisma.chat.findUnique({
      where: { roomId: params.id },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          roomId: params.id,
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: session.user.id,
        senderType: "human",
        type: validated.type || "text",
        content: validated.content,
        mentions: validated.mentions || [],
        attachments: validated.attachments || [],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return successResponse(message);
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
