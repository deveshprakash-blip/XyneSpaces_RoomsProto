import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, handleApiError } from "@/lib/api-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await requireAuth(request);

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
      return errorResponse("FORBIDDEN", "Only owners and admins can remove members", undefined, 403);
    }

    // Prevent removing the last owner
    if (params.userId === session.user.id && membership.role === "owner") {
      const ownerCount = await prisma.userOrganization.count({
        where: {
          organizationId: params.id,
          role: "owner",
        },
      });

      if (ownerCount === 1) {
        return errorResponse("VALIDATION_ERROR", "Cannot remove the last owner", undefined, 400);
      }
    }

    await prisma.userOrganization.delete({
      where: {
        userId_organizationId: {
          userId: params.userId,
          organizationId: params.id,
        },
      },
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
