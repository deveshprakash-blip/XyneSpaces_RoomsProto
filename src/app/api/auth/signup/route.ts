import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const log = (msg: string, data?: Record<string, unknown>) => {
    console.log("[signup]", msg, data ?? "");
  };
  try {
    log("POST received");
    const body = await request.json();
    log("body parsed", { email: (body as { email?: string }).email, hasPassword: !!(body as { password?: string }).password, name: (body as { name?: string }).name });

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const issues = "issues" in parsed.error ? parsed.error.issues : (parsed.error as { errors: { message: string }[] }).errors;
      const msg = Array.isArray(issues) ? issues.map((i: { message?: string }) => i?.message ?? "Invalid").join(" ") : "Invalid input";
      log("validation failed", { msg, issues: issues ?? [] });
      return NextResponse.json({ error: msg || "Invalid input" }, { status: 400 });
    }
    const { email, password, name } = parsed.data;
    const emailLower = email.trim().toLowerCase();
    log("validation ok", { emailLower });

    const existing = await prisma.user.findUnique({
      where: { email: emailLower },
    });
    log("findUnique done", { existing: !!existing });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    log("hashing password");
    const passwordHash = await hash(password, 10);
    const displayName = (name?.trim() || emailLower.split("@")[0]).slice(0, 200);
    log("creating user and org", { displayName });

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: emailLower,
          name: displayName,
          passwordHash,
        },
      });
      log("user created", { userId: user.id });
      const orgName = `${user.name}'s Workspace`;
      await tx.organization.create({
        data: {
          name: orgName,
          slug: `${orgName.toLowerCase().replace(/\s/g, "-")}-${user.id.slice(0, 4)}`,
          members: {
            create: {
              userId: user.id,
              role: "owner",
            },
          },
        },
      });
      log("org created");
    });

    log("signup complete");
    return NextResponse.json({ success: true });
  } catch (e) {
    const err = e as Error & { code?: string; meta?: unknown };
    const message = err?.message ?? String(e);
    const stack = err?.stack;
    const code = err?.code;
    const meta = err?.meta;
    console.error("[signup] error:", {
      message,
      code,
      meta,
      stack: stack?.split("\n").slice(0, 5),
    });
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === "development" ? message : "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
