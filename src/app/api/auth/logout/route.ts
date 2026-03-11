import { NextRequest } from "next/server";
import { signOut } from "@/lib/auth";
import { successResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  await signOut({ redirect: false });
  return successResponse({ loggedOut: true });
}
