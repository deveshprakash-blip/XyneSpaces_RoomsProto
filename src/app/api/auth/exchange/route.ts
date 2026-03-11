import { NextRequest } from "next/server";

/**
 * Entry point for sign-in. Redirects to NextAuth sign-in page.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const callbackUrl = url.searchParams.get("callbackUrl") ?? url.searchParams.get("from") ?? "/";
  const signInUrl = new URL("/api/auth/signin", url.origin);
  signInUrl.searchParams.set("callbackUrl", callbackUrl);
  return Response.redirect(signInUrl.toString());
}
