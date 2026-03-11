import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, handleApiError } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request);
    
    // Verify user has access to this organization
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: params.id,
        },
      },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return errorResponse("NOT_FOUND", "Organization not found or access denied", undefined, 404);
    }

    return successResponse({
      ...membership.organization,
      role: membership.role,
      memberCount: membership.organization._count.members,
      projectCount: membership.organization._count.projects,
    });
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

    // Verify user is owner or admin
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: params.id,
        },
      },
    });

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return errorResponse("FORBIDDEN", "Only owners and admins can update organization", undefined, 403);
    }

    const organization = await prisma.organization.update({
      where: { id: params.id },
      data: {
        name: body.name,
        // slug should not be changed easily
      },
    });

    return successResponse(organization);
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

    // Verify user is owner
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: params.id,
        },
      },
    });

    if (!membership || membership.role !== "owner") {
      return errorResponse("FORBIDDEN", "Only owners can delete organization", undefined, 403);
    }

    await prisma.organization.delete({
      where: { id: params.id },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
