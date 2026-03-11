import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    // Auth removed: always return no session
    return successResponse({ user: null });
  } catch (error) {
    console.error("Session error:", error);
    return errorResponse("INTERNAL_ERROR", error instanceof Error ? error.message : "Failed to get session", [], 500);
  }
}
