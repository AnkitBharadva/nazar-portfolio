/**
 * Shared 1200×630 link-preview card for the homepage and per-project OG
 * images. Pure presentational JSX — no imports beyond React — so it is
 * safe in both the edge runtime (homepage card) and the Node runtime
 * (per-project card).
 *
 * Design follows the site's editorial system: ink-dark background,
 * paper text, restrained gold accent, and the evil-eye motif drawn from
 * nested circles (gold rim, deep-blue iris, dark pupil, white glint).
 * No custom fonts (ImageResponse cannot use next/font) and no external
 * images — system font stacks only.
 */

const INK = "#191714";
const PAPER = "#faf8f3";
const GOLD = "#b45309";
const IRIS = "#1e40af";
const PUPIL = "#0b0f1a";
const MUTED = "#a8a294";
const RULE = "#3d3a34";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Arial, sans-serif";
const MONO = "'Courier New', monospace";

function EvilEye({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: GOLD,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: size * 0.74,
          height: size * 0.74,
          borderRadius: "50%",
          background: IRIS,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: size * 0.38,
            height: size * 0.38,
            borderRadius: "50%",
            background: PUPIL,
            position: "relative",
            // Satori requires an explicit display on any div whose
            // children are not a plain string (the glint below).
            display: "flex",
          }}
        >
          <div
            style={{
              width: size * 0.12,
              height: size * 0.12,
              borderRadius: "50%",
              background: "#ffffff",
              position: "absolute",
              top: size * 0.05,
              left: size * 0.05,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function OgCard({
  eyebrow,
  title,
  subtitle,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: string;
}) {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 64px",
        background: INK,
        color: PAPER,
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 21,
            letterSpacing: 4,
            color: GOLD,
            textTransform: "uppercase",
            paddingTop: 8,
          }}
        >
          {eyebrow}
        </div>
        <EvilEye size={120} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 66,
            lineHeight: 1.05,
            fontWeight: 600,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.35,
            color: MUTED,
            marginTop: 18,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div
        style={{
          borderTop: `1px solid ${RULE}`,
          paddingTop: 22,
          fontFamily: MONO,
          fontSize: 20,
          letterSpacing: 2,
          color: MUTED,
        }}
      >
        {footer}
      </div>
    </div>
  );
}
