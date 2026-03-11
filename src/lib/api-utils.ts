import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export function successResponse<T>(data: T, requestId?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  });
}

export function errorResponse(
  code: string,
  message: string,
  details?: any[],
  status: number = 400,
  requestId?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status }
  );
}

export async function requireAuth(request?: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return errorResponse("UNAUTHORIZED", "Authentication required", undefined, 401);
    }
    return errorResponse("INTERNAL_ERROR", error.message);
  }
  return errorResponse("INTERNAL_ERROR", "An unexpected error occurred");
}
