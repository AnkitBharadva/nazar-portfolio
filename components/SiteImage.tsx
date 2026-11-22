import Image from "next/image";
import type { ImageProps } from "next/image";

/**
 * House image rules, enforced in one place so any image added later — a
 * new section, a project thumbnail, a certificate — automatically follows
 * them: lazy loading (unless `priority`), async decoding, and named
 * `sizes` presets instead of free-form strings. No visual change versus
 * using next/image directly.
 */
const SIZES = {
  /** Hero portrait: desktop column, 448px wide (mobile uses `thumb`). */
  hero: "(max-width: 640px) calc(100vw - 40px), 448px",
  /** Project-card image (none yet — reserved for future card thumbnails). */
  card: "(max-width: 768px) calc(100vw - 40px), 512px",
  /** Achievement certificates: half-width grid on desktop. */
  certificate: "(max-width: 768px) calc(100vw - 80px), 512px",
  /** Case study screenshots: article column, max 704px. */
  screenshot: "(max-width: 768px) calc(100vw - 56px), 704px",
  /** Small mobile portrait beside the name: 96–128px, mobile only. */
  thumb: "128px",
} as const;

export type SiteImagePreset = keyof typeof SIZES;

type SiteImageProps = Omit<ImageProps, "sizes" | "loading" | "decoding"> & {
  preset: SiteImagePreset;
};

export default function SiteImage({
  preset,
  priority = false,
  alt,
  ...props
}: SiteImageProps) {
  return (
    <Image
      {...props}
      alt={alt}
      priority={priority}
      sizes={SIZES[preset]}
      loading={priority ? undefined : "lazy"}
      decoding="async"
    />
  );
}
