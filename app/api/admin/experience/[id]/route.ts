import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSiteData, saveExperience } from "@/lib/store";
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
  const index = data.experience.findIndex((e) => e.id === id);
  if (index === -1) return notFound("Experience entry not found.");
  const next = { ...data.experience[index] };

  if (body.company !== undefined) {
    const v = asString(body.company, 200);
    if (v === null) return badRequest("Invalid company.");
    next.company = v;
  }
  if (body.role !== undefined) {
    const v = asString(body.role, 120);
    if (v === null) return badRequest("Invalid role.");
    next.role = v;
  }
  if (body.companyUrl !== undefined) {
    const v = asOptionalString(body.companyUrl, 500);
    if (v === undefined) return badRequest("Invalid company URL.");
    next.companyUrl = v ?? "";
  }
  if (body.location !== undefined) {
    const v = asOptionalString(body.location, 200);
    if (v === undefined) return badRequest("Invalid location.");
    next.location = v ?? "";
  }
  if (body.period !== undefined) {
    const v = asOptionalString(body.period, 100);
    if (v === undefined) return badRequest("Invalid period.");
    next.period = v ?? "";
  }
  if (body.duration !== undefined) {
    const v = asOptionalString(body.duration, 100);
    if (v === undefined) return badRequest("Invalid duration.");
    next.duration = v ?? "";
  }
  if (body.description !== undefined) {
    const v = asOptionalString(body.description, 1000);
    if (v === undefined) return badRequest("Invalid description.");
    next.description = v ?? "";
  }

  const experience = [...data.experience];
  experience[index] = next;
  await saveExperience(experience);
  return NextResponse.json({ ok: true, experience: next });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { id } = await params;
  const data = await getSiteData();
  const experience = data.experience.filter((e) => e.id !== id);
  if (experience.length === data.experience.length) {
    return notFound("Experience entry not found.");
  }
  await saveExperience(experience);
  return NextResponse.json({ ok: true });
}
