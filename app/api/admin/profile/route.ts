import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSiteData, saveProfile } from "@/lib/store";
import type { Profile } from "@/lib/types";
import {
  asOptionalString,
  asRecord,
  asString,
  asStringArray,
  badRequest,
  readJsonBody,
  requireAdmin,
} from "@/lib/http";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = asRecord(await readJsonBody(req));
  if (!body) return badRequest("Invalid JSON body.");

  const data = await getSiteData();
  const current = data.profile;
  const next: Profile = { ...current };

  if (body.name !== undefined) {
    const v = asString(body.name, 120);
    if (v === null) return badRequest("Invalid name.");
    next.name = v;
  }
  if (body.fullName !== undefined) {
    const v = asString(body.fullName, 120);
    if (v === null) return badRequest("Invalid full name.");
    next.fullName = v;
  }
  if (body.bio !== undefined) {
    const v = asString(body.bio, 4000);
    if (v === null) return badRequest("Invalid bio.");
    next.bio = v;
  }
  if (body.interests !== undefined) {
    const v = asStringArray(body.interests);
    if (v === undefined) return badRequest("Invalid interests.");
    next.interests = v;
  }
  if (body.github !== undefined) {
    const v = asString(body.github, 500);
    if (v === null) return badRequest("Invalid GitHub URL.");
    next.github = v;
  }
  if (body.photo !== undefined) {
    const v = asString(body.photo, 500);
    if (v === null) return badRequest("Invalid photo path.");
    next.photo = v;
  }
  // Contact details are optional strings: clearing one stores "" and the
  // Connect section / resume simply omit that row.
  if (body.email !== undefined) {
    const v = asOptionalString(body.email, 320);
    if (v === undefined) return badRequest("Invalid email.");
    next.email = v ?? "";
  }
  if (body.phone !== undefined) {
    const v = asOptionalString(body.phone, 50);
    if (v === undefined) return badRequest("Invalid phone.");
    next.phone = v ?? "";
  }
  if (body.kaggle !== undefined) {
    const v = asOptionalString(body.kaggle, 500);
    if (v === undefined) return badRequest("Invalid Kaggle URL.");
    next.kaggle = v ?? "";
  }
  if (body.huggingface !== undefined) {
    const v = asOptionalString(body.huggingface, 500);
    if (v === undefined) return badRequest("Invalid Hugging Face URL.");
    next.huggingface = v ?? "";
  }
  if (body.linkedin !== undefined) {
    const v = asOptionalString(body.linkedin, 500);
    if (v === undefined) return badRequest("Invalid LinkedIn URL.");
    next.linkedin = v ?? "";
  }
  if (body.resumeUrl !== undefined) {
    const v = asOptionalString(body.resumeUrl, 500);
    if (v === undefined) return badRequest("Invalid resume URL.");
    next.resumeUrl = v;
  }
  if (body.resumeName !== undefined) {
    const v = asOptionalString(body.resumeName, 300);
    if (v === undefined) return badRequest("Invalid resume name.");
    next.resumeName = v;
  }

  await saveProfile(next);
  return NextResponse.json({ ok: true, profile: next });
}
