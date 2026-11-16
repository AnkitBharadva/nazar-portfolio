import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminConfigured, isAdminRequest } from "@/lib/auth";
import { isGitHubMode } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    admin: isAdminRequest(req),
    configured: isAdminConfigured(),
    storage: isGitHubMode() ? "github" : "file",
  });
}
