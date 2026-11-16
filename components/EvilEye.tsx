import { useId } from "react";

/**
 * The nazar battu evil-eye amulet: gold beaded rim, deep-blue iris with a
 * glass shine. The iris gradient is the one deliberate exception to the
 * site's no-gradient rule — it is the artwork itself.
 */
/**
 * Bead positions around the rim, precomputed once. They were computed at
 * render with Math.cos/Math.sin, but Node and the browser disagree on the
 * last float digits (14.817583288938657 vs 14.817583288938664), which
 * broke hydration on every amulet on the page. Constants can't disagree.
 * (14 beads, radius 45 around center 50,50, starting at the top.)
 */
const BEADS: { x: number; y: number }[] = [
  { x: 50, y: 5 },
  { x: 69.525, y: 9.456 },
  { x: 85.182, y: 21.943 },
  { x: 93.872, y: 39.987 },
  { x: 93.872, y: 60.013 },
  { x: 85.182, y: 78.057 },
  { x: 69.525, y: 90.544 },
  { x: 50, y: 95 },
  { x: 30.475, y: 90.544 },
  { x: 14.818, y: 78.057 },
  { x: 6.128, y: 60.013 },
  { x: 6.128, y: 39.987 },
  { x: 14.818, y: 21.943 },
  { x: 30.475, y: 9.456 },
];

export default function EvilEye({
  size = 64,
  className = "",
  glow = false,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const irisId = `iris-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Nazar battu evil eye"
      className={glow ? `eye-glow ${className}` : className}
    >
      <defs>
        <radialGradient id={irisId} cx="42%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="45%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0b1e4b" />
        </radialGradient>
      </defs>
      {/* gold beaded rim */}
      <circle cx="50" cy="50" r="48" fill="#b45309" />
      {BEADS.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="3.1" fill="#f5c86b" />
      ))}
      {/* white of the eye */}
      <circle cx="50" cy="50" r="40" fill="#fdfbf6" />
      {/* iris */}
      <circle cx="50" cy="50" r="27" fill={`url(#${irisId})`} />
      {/* pupil */}
      <circle cx="50" cy="50" r="12" fill="#0a0a0a" />
      {/* glass shine */}
      <ellipse cx="41" cy="39" rx="7" ry="4.5" fill="#ffffff" opacity="0.85" transform="rotate(-24 41 39)" />
      <circle cx="58" cy="60" r="2.4" fill="#ffffff" opacity="0.5" />
    </svg>
  );
}
