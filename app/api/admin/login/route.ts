import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  isAdminConfigured,
  sessionCookieValue,
  verifyPasscode,
} from "@/lib/auth";
import { asRecord, badRequest, readJsonBody } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin is not configured on this deployment (ADMIN_PASSCODE is unset)." },
      { status: 503 },
    );
  }
  const body = asRecord(await readJsonBody(req));
  const passcode = body?.passcode;
  if (typeof passcode !== "string" || !verifyPasscode(passcode)) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }
  const session = sessionCookieValue();
  const res = NextResponse.json({ ok: true, admin: true });
  res.cookies.set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export async function GET() {
  return badRequest("Use POST with a passcode.");
}
