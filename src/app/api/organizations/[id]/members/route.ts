import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

const addMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(["owner", "admin", "member", "viewer"]),
  team: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request);

    // Verify user has access
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: params.id,
        },
      },
    });

    if (!membership) {
      return errorResponse("NOT_FOUND", "Organization not found or access denied", undefined, 404);
    }

    const members = await prisma.userOrganization.findMany({
      where: { organizationId: params.id },
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
    });

    return successResponse(members);
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
    const validated = addMemberSchema.parse(body);

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
      return errorResponse("FORBIDDEN", "Only owners and admins can add members", undefined, 403);
    }

    const newMembership = await prisma.userOrganization.create({
      data: {
        userId: validated.userId,
        organizationId: params.id,
        role: validated.role,
        team: validated.team,
      },
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
    });

    return successResponse(newMembership);
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
