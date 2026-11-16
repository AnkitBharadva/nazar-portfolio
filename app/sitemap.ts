import type { MetadataRoute } from "next";
import { getSiteData } from "@/lib/store";
import { siteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

/**
 * Sitemap: homepage + resume page + one entry per project, read live
 * from the data store so projects the admin adds later appear
 * automatically.
 *
 * `updated` is used as lastModified only when it parses as a real date;
 * anything else is omitted rather than guessed.
 */
function validDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getSiteData();

  // The homepage changes whenever projects change, so its lastModified is
  // the most recent project update (if any parse).
  let homeModified: Date | undefined;
  for (const p of projects) {
    const d = validDate(p.updated);
    if (d && (!homeModified || d > homeModified)) homeModified = d;
  }

  return [
    {
      url: siteUrl,
      lastModified: homeModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/resume`,
      lastModified: homeModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...projects.map((p) => ({
      url: `${siteUrl}/projects/${p.id}`,
      lastModified: validDate(p.updated),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
