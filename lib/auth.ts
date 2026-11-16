import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "np_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getPasscode(): string | null {
  const value = process.env.ADMIN_PASSCODE;
  return value && value.trim().length > 0 ? value : null;
}

function getSecret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSCODE || "nazar-portfolio-dev-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** True when the supplied passcode matches ADMIN_PASSCODE. Admin is disabled when the env var is unset. */
export function verifyPasscode(candidate: string): boolean {
  const passcode = getPasscode();
  if (!passcode) return false;
  return safeEqual(candidate, passcode);
}

export function isAdminConfigured(): boolean {
  return getPasscode() !== null;
}

/** Create a signed session token (payload.signature). */
export function createSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_TTL_MS }),
    "utf8",
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: unknown;
    };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function isAdminRequest(req: NextRequest): boolean {
  return verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value);
}

export function sessionCookieValue(): { name: string; value: string; maxAge: number } {
  return { name: ADMIN_COOKIE, value: createSessionToken(), maxAge: SESSION_TTL_MS / 1000 };
}
