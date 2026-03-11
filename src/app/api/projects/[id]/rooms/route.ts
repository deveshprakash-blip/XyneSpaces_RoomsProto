import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, handleApiError } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request);

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return errorResponse("NOT_FOUND", "Project not found", undefined, 404);
    }

    // Verify user has access
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
      where: { projectId: params.id },
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
