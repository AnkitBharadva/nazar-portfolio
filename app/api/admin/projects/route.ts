import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSiteData, saveProjects } from "@/lib/store";
import type { Project, ProjectMetric } from "@/lib/types";
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

const METRIC_SOURCES = ["per README", "verified in repo", "repo docs"] as const;

function parseMetrics(value: unknown): ProjectMetric[] | undefined {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return undefined;
  const out: ProjectMetric[] = [];
  for (const item of value) {
    const rec = asRecord(item);
    if (!rec) return undefined;
    const label = asString(rec.label, 120);
    const metricValue = asString(rec.value, 120);
    const source = rec.source;
    if (
      !label ||
      !metricValue ||
      typeof source !== "string" ||
      !(METRIC_SOURCES as readonly string[]).includes(source)
    ) {
      return undefined;
    }
    out.push({ label, value: metricValue, source: source as ProjectMetric["source"] });
  }
  return out;
}

/** Validate a full project payload (create) or a partial one (patch). */
export function parseProjectInput(
  body: Record<string, unknown>,
  partial: boolean,
): Partial<Project> | null {
  const out: Partial<Project> = {};

  const name = body.name === undefined ? undefined : asString(body.name, 120);
  if (name === null) return null;
  if (name !== undefined) out.name = name;
  else if (!partial) return null;

  const displayTitle =
    body.displayTitle === undefined ? undefined : asString(body.displayTitle, 200);
  if (displayTitle === null) return null;
  if (displayTitle !== undefined) out.displayTitle = displayTitle;
  else if (!partial) return null;

  const tagline = body.tagline === undefined ? undefined : asString(body.tagline, 300);
  if (tagline === null) return null;
  if (tagline !== undefined) out.tagline = tagline;
  else if (!partial) return null;

  const description =
    body.description === undefined ? undefined : asString(body.description, 4000);
  if (description === null) return null;
  if (description !== undefined) out.description = description;
  else if (!partial) return null;

  const repo = body.repo === undefined ? undefined : asString(body.repo, 500);
  if (repo === null) return null;
  if (repo !== undefined) out.repo = repo;
  else if (!partial) return null;

  const liveDemo = asOptionalString(body.liveDemo, 500);
  if (liveDemo === undefined) return null;
  if (liveDemo !== null || body.liveDemo !== undefined) out.liveDemo = liveDemo;

  const language = asOptionalString(body.language, 80);
  if (language === undefined) return null;
  if (language !== null || body.language !== undefined) out.language = language;

  if (body.updated !== undefined) {
    const updated = asString(body.updated, 20);
    if (updated === null || !/^\d{4}-\d{2}-\d{2}$/.test(updated)) return null;
    out.updated = updated;
  } else if (!partial) {
    out.updated = new Date().toISOString().slice(0, 10);
  }

  if (body.files !== undefined) {
    const files = body.files;
    if (typeof files !== "number" || !Number.isInteger(files) || files < 0) return null;
    out.files = files;
  } else if (!partial) out.files = 0;

  if (body.stars !== undefined) {
    const stars = body.stars;
    if (typeof stars !== "number" || !Number.isInteger(stars) || stars < 0) return null;
    out.stars = stars;
  } else if (!partial) out.stars = 0;

  if (body.stack !== undefined) {
    const stack = asStringArray(body.stack);
    if (stack === undefined) return null;
    out.stack = stack;
  } else if (!partial) out.stack = [];

  if (body.metrics !== undefined) {
    const metrics = parseMetrics(body.metrics);
    if (metrics === undefined) return null;
    out.metrics = metrics;
  } else if (!partial) out.metrics = [];

  for (const key of ["fork", "featured", "sealed", "empty", "template", "synthetic"] as const) {
    if (body[key] !== undefined) {
      if (typeof body[key] !== "boolean") return null;
      out[key] = body[key];
    } else if (!partial) {
      out[key] = false;
    }
  }

  const forkCredit = asOptionalString(body.forkCredit, 500);
  if (forkCredit === undefined) return null;
  if (forkCredit !== null || body.forkCredit !== undefined) out.forkCredit = forkCredit;

  const notes = asOptionalString(body.notes, 1000);
  if (notes === undefined) return null;
  if (notes !== null || body.notes !== undefined) out.notes = notes;

  return out;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "project"
  );
}

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const body = asRecord(await readJsonBody(req));
  if (!body) return badRequest("Invalid JSON body.");
  const input = parseProjectInput(body, false);
  if (!input) return badRequest("Missing or invalid project fields.");

  const data = await getSiteData();
  let id = slugify(input.name as string);
  if (data.projects.some((p) => p.id === id)) {
    id = `${id}-${Date.now().toString(36)}`;
  }
  const project: Project = {
    id,
    name: input.name as string,
    displayTitle: input.displayTitle as string,
    tagline: input.tagline as string,
    description: input.description as string,
    repo: input.repo as string,
    liveDemo: input.liveDemo ?? null,
    language: input.language ?? null,
    updated: input.updated as string,
    files: input.files ?? 0,
    stars: input.stars ?? 0,
    stack: input.stack ?? [],
    metrics: input.metrics ?? [],
    fork: input.fork ?? false,
    forkCredit: input.forkCredit ?? null,
    featured: input.featured ?? false,
    sealed: input.sealed ?? false,
    empty: input.empty ?? false,
    template: input.template ?? false,
    synthetic: input.synthetic ?? false,
    notes: input.notes ?? null,
  };
  const projects = [project, ...data.projects];
  await saveProjects(projects);
  return NextResponse.json({ ok: true, project }, { status: 201 });
}
