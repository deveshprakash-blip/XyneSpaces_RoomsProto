import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

const createOrgSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    
    // Get all organizations user is a member of
    const memberships = await prisma.userOrganization.findMany({
      where: { userId: session.user.id },
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

    const organizations = memberships.map((m: any) => ({
      ...m.organization,
      role: m.role,
      memberCount: m.organization._count.members,
      projectCount: m.organization._count.projects,
    }));

    return successResponse(organizations);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const validated = createOrgSchema.parse(body);

    const slug = validated.slug || validated.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Check if slug exists
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      return errorResponse("VALIDATION_ERROR", "Organization with this slug already exists", undefined, 409);
    }

    const organization = await prisma.$transaction(async (tx: any) => {
      const org = await tx.organization.create({
        data: {
          name: validated.name,
          slug: `${slug}-${Date.now()}`,
        },
      });

      await tx.userOrganization.create({
        data: {
          userId: session.user.id,
          organizationId: org.id,
          role: "owner",
        },
      });

      return org;
    });

    return successResponse(organization);
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
