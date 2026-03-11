import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 3000)
    );
    
    const sessionPromise = auth();
    const session = await Promise.race([sessionPromise, timeoutPromise]);
    
    if (!session) {
      return errorResponse("UNAUTHORIZED", "No active session", [], 401);
    }
    
    return successResponse(session);
  } catch (error) {
    console.error("Session error:", error);
    return errorResponse("INTERNAL_ERROR", error instanceof Error ? error.message : "Failed to get session", [], 500);
  }
}
