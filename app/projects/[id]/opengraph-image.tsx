import { ImageResponse } from "next/og";
import OgCard from "@/components/OgCard";
import { getSiteData } from "@/lib/store";
import { isSealable } from "@/lib/tiers";

export const runtime = "nodejs";
export const alt = "Nazar-Proof Portfolio — project case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Per-project link-preview card (1200×630), served at
 * /projects/[id]/opengraph-image and picked up as the og:image /
 * twitter:image for that case study page.
 *
 * Node runtime: the card reads the project from the data store, which
 * needs filesystem access in file mode. An unknown id — or a data read
 * failure — falls back to the generic homepage-style card; this route
 * never errors.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let project = null;
  try {
    const { projects } = await getSiteData();
    project = projects.find((p) => p.id === id) ?? null;
  } catch {
    project = null;
  }

  if (!project) {
    return new ImageResponse(
      (
        <OgCard
          eyebrow="Portfolio"
          title="Ankit Bharadva"
          subtitle="Nazar-Proof Portfolio — machine learning, data & Generative AI systems, sealed behind the evil eye."
          footer="ANKIT BHARADVA — NAZAR-PROOF PORTFOLIO"
        />
      ),
      { width: 1200, height: 630 },
    );
  }

  // The footer matches the case study itself: only a veiled case study
  // (a sealed collection project) asks the reader to remove the nazar.
  // Featured projects open unsealed, so they get the
  // neutral portfolio footer.
  const footer = isSealable(project)
    ? "REMOVE THE NAZAR TO READ THE CASE STUDY"
    : "ANKIT BHARADVA — NAZAR-PROOF PORTFOLIO";

  return new ImageResponse(
    (
      <OgCard
        eyebrow="Case Study"
        title={project.name}
        subtitle={project.displayTitle}
        footer={footer}
      />
    ),
    { width: 1200, height: 630 },
  );
}
