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
      include: {
        organization: true,
        _count: {
          select: {
            rooms: true,
            tickets: true,
          },
        },
      },
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

    return successResponse(project);
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

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return errorResponse("NOT_FOUND", "Project not found", undefined, 404);
    }

    // Verify user has access and permissions
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: project.organizationId,
        },
      },
    });

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return errorResponse("FORBIDDEN", "Only owners and admins can update project", undefined, 403);
    }

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        color: body.color,
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

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return errorResponse("NOT_FOUND", "Project not found", undefined, 404);
    }

    // Verify user has access and permissions
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: project.organizationId,
        },
      },
    });

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return errorResponse("FORBIDDEN", "Only owners and admins can delete project", undefined, 403);
    }

    await prisma.project.delete({
      where: { id: params.id },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
