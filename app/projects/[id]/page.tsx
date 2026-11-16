import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudy from "@/components/CaseStudy";
import { getCachedSiteData } from "@/lib/store";
import { getScreenshots } from "@/lib/screenshots";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

// One request-cached read, shared with the root layout (which decides the
// 404) and generateMetadata — a single data read per case-study request.
const getData = getCachedSiteData;

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const { projects } = await getData();
  const project = projects.find((p) => p.id === id);
  if (!project) {
    return { title: "Project not found — Ankit Bharadva" };
  }
  const title = `${project.displayTitle} — ${project.name} | Ankit Bharadva`;
  const url = `/projects/${project.id}`;
  return {
    title,
    description: project.tagline,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: project.tagline,
      url,
      siteName: "Ankit Bharadva",
      locale: "en_IN",
      type: "article",
      // og:image comes from app/projects/[id]/opengraph-image.tsx
      // (Next picks it up automatically for this segment).
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.tagline,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const data = await getData();
  const index = data.projects.findIndex((p) => p.id === id);
  if (index === -1) notFound();

  // Dynamic params: any id in the data gets a page, including projects the
  // admin adds later. Nothing about the 23 seed ids is hardcoded here.
  const project: Project = data.projects[index];
  const prev = index > 0 ? data.projects[index - 1] : null;
  const next =
    index < data.projects.length - 1 ? data.projects[index + 1] : null;

  return (
    <CaseStudy
      project={project}
      index={index}
      total={data.projects.length}
      prev={prev}
      next={next}
      screenshots={getScreenshots(project.id)}
      profileName={data.profile.name}
      github={data.profile.github}
    />
  );
}
