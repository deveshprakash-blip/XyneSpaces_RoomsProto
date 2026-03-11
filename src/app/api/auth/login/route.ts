import { NextRequest } from "next/server";
import { signIn } from "next-auth/react";
import { errorResponse } from "@/lib/api-utils";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Note: Actual login is handled by NextAuth's signIn
// This endpoint is for custom login flow if needed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    // NextAuth handles the actual authentication
    // This is just a wrapper that returns success
    return errorResponse(
      "NOT_IMPLEMENTED",
      "Use NextAuth signIn function on the client side, or POST to /api/auth/callback/credentials",
      undefined,
      501
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid input",
        error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
      );
    }
    return errorResponse("INTERNAL_ERROR", error instanceof Error ? error.message : "Failed to login");
  }
}
