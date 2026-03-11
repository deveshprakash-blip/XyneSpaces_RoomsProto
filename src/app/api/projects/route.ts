import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

const createProjectSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    let where: any = {};
    
    if (organizationId) {
      // Verify user has access to this organization
      const membership = await prisma.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId,
          },
        },
      });

      if (!membership) {
        return errorResponse("FORBIDDEN", "Access denied to this organization", undefined, 403);
      }

      where.organizationId = organizationId;
    } else {
      // Get all projects from organizations user is a member of
      const memberships = await prisma.userOrganization.findMany({
        where: { userId: session.user.id },
        select: { organizationId: true },
      });

      where.organizationId = {
        in: memberships.map((m: any) => m.organizationId),
      };
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: {
            rooms: true,
            tickets: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(projects);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    // Verify user has access to organization
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: validated.organizationId,
        },
      },
    });

    if (!membership || !["owner", "admin", "member"].includes(membership.role)) {
      return errorResponse("FORBIDDEN", "Insufficient permissions to create project", undefined, 403);
    }

    const project = await prisma.project.create({
      data: {
        organizationId: validated.organizationId,
        name: validated.name,
        description: validated.description,
        color: validated.color,
        createdBy: session.user.id,
      },
    });

    return successResponse(project);
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
