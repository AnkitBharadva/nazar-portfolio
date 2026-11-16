import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSiteData, saveAchievements } from "@/lib/store";
import type { Achievement } from "@/lib/types";
import {
  asOptionalString,
  asRecord,
  asString,
  badRequest,
  readJsonBody,
  requireAdmin,
} from "@/lib/http";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "achievement"
  );
}

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = asRecord(await readJsonBody(req));
  if (!body) return badRequest("Invalid JSON body.");

  const title = asString(body.title, 120);
  const event = asString(body.event, 200);
  if (!title || !event) return badRequest("Title and event are required.");

  const year = body.year;
  if (typeof year !== "number" || !Number.isInteger(year) || year < 1900 || year > 2100) {
    return badRequest("A valid year is required.");
  }

  const description = asOptionalString(body.description, 1000);
  if (description === undefined) return badRequest("Invalid description.");
  const certificateUrl = asOptionalString(body.certificateUrl, 500);
  const certificateName = asOptionalString(body.certificateName, 200);
  if (certificateUrl === undefined || certificateName === undefined) {
    return badRequest("Invalid certificate fields.");
  }

  const data = await getSiteData();
  let id = slugify(`${event}-${year}`);
  if (data.achievements.some((a) => a.id === id)) {
    id = `${id}-${Date.now().toString(36)}`;
  }
  const achievement: Achievement = {
    id,
    title,
    event,
    year,
    description: description ?? "",
    certificateUrl: certificateUrl ?? null,
    certificateName: certificateName ?? null,
  };
  await saveAchievements([...data.achievements, achievement]);
  return NextResponse.json({ ok: true, achievement }, { status: 201 });
}
