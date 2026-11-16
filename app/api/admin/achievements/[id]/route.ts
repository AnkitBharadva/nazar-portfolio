import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSiteData, saveAchievements } from "@/lib/store";
import {
  asOptionalString,
  asRecord,
  asString,
  badRequest,
  notFound,
  readJsonBody,
  requireAdmin,
} from "@/lib/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { id } = await params;
  const body = asRecord(await readJsonBody(req));
  if (!body) return badRequest("Invalid JSON body.");

  const data = await getSiteData();
  const index = data.achievements.findIndex((a) => a.id === id);
  if (index === -1) return notFound("Achievement not found.");
  const next = { ...data.achievements[index] };

  if (body.title !== undefined) {
    const v = asString(body.title, 120);
    if (v === null) return badRequest("Invalid title.");
    next.title = v;
  }
  if (body.event !== undefined) {
    const v = asString(body.event, 200);
    if (v === null) return badRequest("Invalid event.");
    next.event = v;
  }
  if (body.year !== undefined) {
    const v = body.year;
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1900 || v > 2100) {
      return badRequest("Invalid year.");
    }
    next.year = v;
  }
  if (body.description !== undefined) {
    const v = asOptionalString(body.description, 1000);
    if (v === undefined) return badRequest("Invalid description.");
    next.description = v ?? "";
  }
  if (body.certificateUrl !== undefined || body.certificateName !== undefined) {
    const url = asOptionalString(body.certificateUrl, 500);
    const name = asOptionalString(body.certificateName, 200);
    if (url === undefined || name === undefined) {
      return badRequest("Invalid certificate fields.");
    }
    next.certificateUrl = url;
    next.certificateName = name;
  }

  const achievements = [...data.achievements];
  achievements[index] = next;
  await saveAchievements(achievements);
  return NextResponse.json({ ok: true, achievement: next });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { id } = await params;
  const data = await getSiteData();
  const achievements = data.achievements.filter((a) => a.id !== id);
  if (achievements.length === data.achievements.length) {
    return notFound("Achievement not found.");
  }
  await saveAchievements(achievements);
  return NextResponse.json({ ok: true });
}
