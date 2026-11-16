/**
 * Lemon + chillies hanging — the classic nimbu-mirchi nazar battu,
 * drawn as inline SVG so it needs no image asset.
 */
export default function LemonChilli({
  width = 72,
  className = "",
}: {
  width?: number;
  className?: string;
}) {
  const height = (width * 120) / 72;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 72 120"
      role="img"
      aria-label="Lemon and chillies"
      className={className}
    >
      {/* thread */}
      <line x1="36" y1="0" x2="36" y2="30" stroke="#191714" strokeWidth="2" />
      <circle cx="36" cy="32" r="3" fill="#b45309" />
      {/* lemon */}
      <ellipse cx="36" cy="56" rx="17" ry="20" fill="#f2c531" />
      <ellipse cx="36" cy="56" rx="17" ry="20" fill="none" stroke="#c99a12" strokeWidth="1.5" />
      <ellipse cx="30" cy="48" rx="4.5" ry="7" fill="#fbe27a" opacity="0.9" transform="rotate(-18 30 48)" />
      <path d="M36 36 Q40 28 48 28 Q42 33 36 36" fill="#2f7d32" />
      {/* chillies */}
      <g>
        <path d="M24 82 Q16 100 24 112 Q30 100 28 82 Z" fill="#c62828" />
        <path d="M26 80 Q24 76 28 74" stroke="#2f7d32" strokeWidth="2.5" fill="none" />
        <path d="M36 84 Q36 102 30 114 Q42 106 40 84 Z" fill="#2e7d32" />
        <path d="M38 82 Q40 78 36 76" stroke="#2f7d32" strokeWidth="2.5" fill="none" />
        <path d="M48 82 Q56 100 48 112 Q42 100 44 82 Z" fill="#c62828" />
        <path d="M46 80 Q48 76 44 74" stroke="#2f7d32" strokeWidth="2.5" fill="none" />
      </g>
    </svg>
  );
}
