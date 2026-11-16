import { ImageResponse } from "next/og";
import OgCard from "@/components/OgCard";

export const alt = "Ankit Bharadva — Nazar-Proof Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Homepage link-preview card (1200×630). Static — no data reads — so it
 * is prerendered at build time. Served automatically at /opengraph-image
 * and picked up as the og:image / twitter:image for the homepage.
 */
export default function Image() {
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
