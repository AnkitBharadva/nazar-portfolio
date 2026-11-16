import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSiteData, saveProjects } from "@/lib/store";
import { asRecord, badRequest, notFound, readJsonBody, requireAdmin } from "@/lib/http";
import { parseProjectInput } from "../route";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { id } = await params;
  const body = asRecord(await readJsonBody(req));
  if (!body) return badRequest("Invalid JSON body.");
  const input = parseProjectInput(body, true);
  if (!input) return badRequest("Invalid project fields.");

  const data = await getSiteData();
  const index = data.projects.findIndex((p) => p.id === id);
  if (index === -1) return notFound("Project not found.");
  const updated = { ...data.projects[index], ...input, id };
  const projects = [...data.projects];
  projects[index] = updated;
  await saveProjects(projects);
  return NextResponse.json({ ok: true, project: updated });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { id } = await params;
  const data = await getSiteData();
  const projects = data.projects.filter((p) => p.id !== id);
  if (projects.length === data.projects.length) return notFound("Project not found.");
  await saveProjects(projects);
  return NextResponse.json({ ok: true });
}
