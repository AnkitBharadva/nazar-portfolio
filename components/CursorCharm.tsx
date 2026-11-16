"use client";

import { useEffect, useRef } from "react";
import LemonChilli from "./LemonChilli";

/**
 * A very small nimbu-mirchi that hangs from the cursor arrow's tip and
 * follows the mouse everywhere on the site. The charm is attached
 * exactly to the tip (the cursor hotspot): the thread in the SVG runs
 * down the centre of the viewBox (x=36 of 72) and starts at the very
 * top edge (y=0), so at width 16 the thread sits 8px from the charm's
 * left edge and the div's top edge is the thread's start — the div is
 * placed at (cursorX - 8, cursorY), no gap, so the thread touches the
 * tip point precisely.
 *
 * Desktop only: it activates only for fine pointers (a real mouse) and
 * stays off under prefers-reduced-motion. It never intercepts clicks
 * (pointer-events-none) and moves on transform only, rAF-throttled, so
 * tracking costs one composited layer move per frame at most. The div
 * renders on the server too (invisible, off-screen) so there is no
 * hydration mismatch — the effect only attaches the tracking when the
 * pointer and motion settings allow it.
 */
export default function CursorCharm() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!fine || reduced) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let x = -100;
    let y = -100;
    let pending = false;

    const apply = () => {
      pending = false;
      // Thread centre (8px from the charm's left edge at width 16) on
      // the tip's x, thread start (the div's top edge) on the tip's y —
      // no gap, so the charm is tied to the cursor point exactly.
      el.style.transform = `translate3d(${x - 8}px, ${y}px, 0)`;
      el.style.opacity = "1";
    };
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!pending) {
        pending = true;
        raf = requestAnimationFrame(apply);
      }
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-cursor-charm
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0"
      style={{ transform: "translate3d(-100px, -100px, 0)" }}
    >
      <LemonChilli width={16} />
    </div>
  );
}
