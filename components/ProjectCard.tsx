"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import EvilEye from "./EvilEye";
import LemonChilli from "./LemonChilli";

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ProjectCard({
  project,
  index,
  unlocked,
  alwaysUnsealed = false,
  onUnlock,
  admin,
  onEdit,
  onRemove,
}: {
  project: Project;
  index: number;
  unlocked: boolean;
  /** Featured projects are always on show — the veil never renders,
   *  whatever the unlock store says. */
  alwaysUnsealed?: boolean;
  onUnlock: (id: string) => void;
  admin: boolean;
  onEdit: (project: Project) => void;
  onRemove: (project: Project) => void;
}) {
  const [ritual, setRitual] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Featured cards render unsealed from the first paint; every other
  // card follows the unlock store.
  const open = unlocked || alwaysUnsealed;

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const removeNazar = () => {
    if (unlocked || ritual) return;
    setRitual(true);
    timer.current = setTimeout(() => {
      setRitual(false);
      onUnlock(project.id);
    }, 900);
  };

  return (
    <article
      className={`project-card relative flex flex-col border border-hairline bg-white ${ritual ? "ritual-shake" : ""}`}
    >
      {/* Card header — always visible. Title first with the full width
          (long names wrap to a second line instead of truncating); the
          meta sits below in two short lines — number + language, then
          the date — so no line can ever wrap mid-phrase, even for the
          longest language ("Jupyter Notebook") in the narrow 4-column
          Featured grid. The title reserves two lines of height so the
          meta lines align across a row. */}
      <header className="border-b border-hairline px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-h-[3.125rem] min-w-0 font-display text-xl font-semibold leading-tight">
            {project.name}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5 pt-1">
            {project.stars > 0 && (
              <span className="border border-hairline px-1.5 py-0.5 font-mono text-[11px] text-ink-soft">
                ★ {project.stars}
              </span>
            )}
            {project.fork && (
              <span className="border border-accent px-1.5 py-0.5 font-mono text-[11px] text-accent">
                Fork
              </span>
            )}
            {project.liveDemo && (
              <span className="border border-hairline px-1.5 py-0.5 font-mono text-[11px] text-ink-soft">
                Live
              </span>
            )}
          </div>
        </div>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {String(index + 1).padStart(2, "0")} · {project.language ?? "—"}
        </p>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {formatDate(project.updated)}
        </p>
      </header>

      {/* Admin controls (never shown to visitors) */}
      {admin && (
        <div className="flex gap-2 border-b border-dashed border-hairline bg-paper-deep px-5 py-2">
          <button
            type="button"
            onClick={() => onEdit(project)}
            className="font-mono text-[11px] uppercase tracking-widest text-accent underline underline-offset-2"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onRemove(project)}
            className="font-mono text-[11px] uppercase tracking-widest text-red-800 underline underline-offset-2"
          >
            Remove
          </button>
        </div>
      )}

      {/* Body — blurred while sealed */}
      <div className={`relative flex-1 ${open ? "unsealed-body" : "sealed-body"}`}>
        <div className="px-5 py-4">
          <p className="font-display text-[17px] font-medium leading-snug">{project.displayTitle}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{project.tagline}</p>
          {/* The long description is clamped to three lines with a fade
              on the card — the full text lives in the case study.
              Short descriptions (<= 200 chars) fit in ~3 lines at
              every card width, so they render in full with no fade. */}
          <p
            className={`mt-3 text-sm leading-relaxed text-ink-soft ${project.description.length > 200 ? "desc-clamp" : ""}`}
          >
            {project.description}
          </p>

          {project.metrics.length > 0 && (
            <dl className="mt-4 border-t border-hairline">
              {project.metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex items-baseline justify-between gap-3 border-b border-hairline py-2"
                >
                  <dt className="min-w-0 text-xs text-muted">{m.label}</dt>
                  <dd className="text-right font-mono text-sm font-semibold">
                    {m.value}{" "}
                    <span className="font-sans text-[10px] font-normal text-muted">
                      ({m.source})
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {project.stack.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <li
                  key={s}
                  className="border border-hairline px-2 py-0.5 font-mono text-[11px] text-ink-soft"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}

          {project.forkCredit && (
            <p className="mt-4 border-l-2 border-accent bg-paper-deep px-3 py-2 text-xs leading-relaxed text-ink-soft">
              {project.forkCredit}
            </p>
          )}
          {project.synthetic && (
            <p className="mt-3 border-l-2 border-gold bg-paper-deep px-3 py-2 text-xs leading-relaxed text-ink-soft">
              Built on synthetic data — the PaySim dataset simulates mobile-money
              transactions; it is not real UPI data.
            </p>
          )}
          {project.notes && (
            <p className="mt-3 text-xs leading-relaxed text-muted">{project.notes}</p>
          )}
        </div>
      </div>

      {/* Links — always reachable, even while sealed */}
      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline px-5 py-3">
        <a
          href={project.repo}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-accent underline underline-offset-2"
        >
          Repo ↗
        </a>
        {project.liveDemo && (
          <a
            href={project.liveDemo}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-accent underline underline-offset-2"
          >
            Live demo ↗
          </a>
        )}
        <Link
          href={`/projects/${project.id}`}
          className="font-mono text-xs text-accent underline underline-offset-2"
        >
          Read the case study →
        </Link>
        <span className="ml-auto font-mono text-[11px] text-muted">
          {project.files} files
        </span>
      </footer>

      {/* Sealed veil */}
      {!open && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-veil/92 px-4 text-center">
          <div className={ritual ? "ritual-eye" : ""}>
            <EvilEye size={72} glow={!ritual} />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/70">
            Sealed by nazar
          </p>
          <button
            type="button"
            onClick={removeNazar}
            disabled={ritual}
            className="group flex items-center gap-3 border border-white/40 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-70"
            aria-label={`Remove nazar from ${project.name}`}
          >
            <LemonChilli width={22} />
            {ritual ? "Removing nazar…" : "Remove nazar"}
          </button>
        </div>
      )}
    </article>
  );
}
