import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, handleApiError } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request);

    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            organization: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        chat: true,
        board: true,
      },
    });

    if (!room) {
      return errorResponse("NOT_FOUND", "Room not found", undefined, 404);
    }

    // Verify user has access
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

    return successResponse(room);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();

    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    });

    if (!room) {
      return errorResponse("NOT_FOUND", "Room not found", undefined, 404);
    }

    // Verify user is room member or org admin
    const roomMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: params.id,
          userId: session.user.id,
        },
      },
    });

    const orgMembership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: room.project.organizationId,
        },
      },
    });

    if (!roomMember && !orgMembership || (orgMembership && !["owner", "admin"].includes(orgMembership.role))) {
      return errorResponse("FORBIDDEN", "Insufficient permissions", undefined, 403);
    }

    const updated = await prisma.room.update({
      where: { id: params.id },
      data: {
        name: body.name,
        contextFilePath: body.contextFilePath,
      },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request);

    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    });

    if (!room) {
      return errorResponse("NOT_FOUND", "Room not found", undefined, 404);
    }

    // Verify user is room owner or org admin
    const roomMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: params.id,
          userId: session.user.id,
        },
      },
    });

    const orgMembership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: room.project.organizationId,
        },
      },
    });

    if ((!roomMember || roomMember.role !== "owner") && (!orgMembership || !["owner", "admin"].includes(orgMembership.role))) {
      return errorResponse("FORBIDDEN", "Only room owners or org admins can delete room", undefined, 403);
    }

    await prisma.room.delete({
      where: { id: params.id },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
