/**
 * Canonical site URL. Every absolute URL the site emits — sitemap,
 * robots.txt, canonical links, OG URLs, JSON-LD — derives from this one
 * helper, so the domain lives in exactly one place.
 *
 * Set NEXT_PUBLIC_SITE_URL to the real deployed domain on Vercel (e.g.
 * https://your-portfolio.vercel.app). Until it is set, everything points at
 * localhost: no domain is invented here.
 */
function readSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export const siteUrl = readSiteUrl();

/** Absolute URL for a path on this site (path must start with "/"). */
export function siteUrlFor(path: string): string {
  return `${siteUrl}${path}`;
}
