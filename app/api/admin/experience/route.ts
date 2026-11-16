import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSiteData, saveExperience } from "@/lib/store";
import type { Experience } from "@/lib/types";
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
      .slice(0, 60) || "experience"
  );
}

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = asRecord(await readJsonBody(req));
  if (!body) return badRequest("Invalid JSON body.");

  const company = asString(body.company, 200);
  const role = asString(body.role, 120);
  if (!company || !role) return badRequest("Company and role are required.");

  const companyUrl = asOptionalString(body.companyUrl, 500);
  const location = asOptionalString(body.location, 200);
  const period = asOptionalString(body.period, 100);
  const duration = asOptionalString(body.duration, 100);
  const description = asOptionalString(body.description, 1000);
  if (
    companyUrl === undefined ||
    location === undefined ||
    period === undefined ||
    duration === undefined ||
    description === undefined
  ) {
    return badRequest("Invalid experience fields.");
  }

  const data = await getSiteData();
  let id = slugify(`${company}-${period ?? ""}`);
  if (data.experience.some((e) => e.id === id)) {
    id = `${id}-${Date.now().toString(36)}`;
  }
  const entry: Experience = {
    id,
    company,
    companyUrl: companyUrl ?? "",
    role,
    location: location ?? "",
    period: period ?? "",
    duration: duration ?? "",
    description: description ?? "",
  };
  await saveExperience([...data.experience, entry]);
  return NextResponse.json({ ok: true, experience: entry }, { status: 201 });
}
