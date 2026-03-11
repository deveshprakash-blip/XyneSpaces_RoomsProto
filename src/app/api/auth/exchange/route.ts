import { NextRequest, NextResponse } from "next/server";

/**
 * Entry point for sign-in. Auth removed — redirect to home.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/", url.origin));
}
