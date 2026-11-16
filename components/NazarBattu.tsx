import EvilEye from "./EvilEye";
import LemonChilli from "./LemonChilli";

/**
 * The full hanging nazar battu: black thread, black-and-gold beads, the
 * amulet, and lemon + chillies. Sways gently; pass a changing `swingKey`
 * to make it swing hard (e.g. when a project is unsealed).
 */
export default function NazarBattu({
  swingKey = 0,
  caption = true,
  className = "",
}: {
  swingKey?: number;
  caption?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center ${className}`} aria-hidden="true">
      <div key={swingKey} className={swingKey > 0 ? "battu-hang swing" : "battu-hang"}>
        <div className="flex flex-col items-center">
          {/* thread */}
          <div className="h-10 w-0.5 bg-ink" />
          {/* beads */}
          <div className="flex items-center gap-1.5">
            <span className="block h-2.5 w-2.5 rounded-full bg-ink" />
            <span className="block h-2 w-2 rounded-full bg-gold" />
            <span className="block h-2.5 w-2.5 rounded-full bg-ink" />
            <span className="block h-2 w-2 rounded-full bg-gold" />
            <span className="block h-2.5 w-2.5 rounded-full bg-ink" />
          </div>
          <div className="h-1.5 w-0.5 bg-ink" />
          <EvilEye size={92} glow />
          <div className="h-1 w-0.5 bg-ink" />
          <LemonChilli width={54} />
        </div>
      </div>
      {caption && (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          nazar battu
        </p>
      )}
    </div>
  );
}
