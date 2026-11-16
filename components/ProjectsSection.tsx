"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { isCollection, isFeatured } from "@/lib/tiers";
import ProjectCard from "./ProjectCard";
import EvilEye from "./EvilEye";

export type ProjectFilter = "all" | "originals" | "forks" | "live" | "sealed";

/** Collection cards rendered per batch. The full data stays in memory —
// only the DOM is progressive, so search, filters, counters and
// unlock-all keep working across every collection project, visible or
// not. */
const PAGE_SIZE = 9;

const FILTERS: { id: ProjectFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "originals", label: "Originals" },
  { id: "forks", label: "Forks" },
  { id: "live", label: "Live demos" },
  { id: "sealed", label: "Sealed" },
];

export default function ProjectsSection({
  projects,
  unlocked,
  onUnlock,
  onUnlockAll,
  onResealAll,
  admin,
  onEditProject,
  onRemoveProject,
  onAddProject,
}: {
  projects: Project[];
  unlocked: Set<string>;
  onUnlock: (id: string) => void;
  onUnlockAll: () => void;
  onResealAll: () => void;
  admin: boolean;
  onEditProject: (project: Project) => void;
  onRemoveProject: (project: Project) => void;
  onAddProject: () => void;
}) {
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);

  // The two tiers. Featured is an explicit flag; everything else is
  // the nazar collection — forks, the empty repo and the template
  // portfolio included, still labelled on their cards. Card numbers
  // still come from the position in the full array, so they never
  // change when a project moves tier.
  const featured = useMemo(() => projects.filter(isFeatured), [projects]);
  const collection = useMemo(() => projects.filter(isCollection), [projects]);
  const indexOf = useMemo(
    () => new Map(projects.map((p, i) => [p.id, i])),
    [projects],
  );

  // A new filter or search starts from the first batch again. The reset
  // happens in the event handlers (not an effect) so there is no extra
  // render pass.
  const applyFilter = (f: ProjectFilter) => {
    setFilter(f);
    setShown(PAGE_SIZE);
  };
  const applyQuery = (q: string) => {
    setQuery(q);
    setShown(PAGE_SIZE);
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return collection.filter((p) => {
      if (filter === "originals" && p.fork) return false;
      if (filter === "forks" && !p.fork) return false;
      if (filter === "live" && !p.liveDemo) return false;
      if (filter === "sealed" && !p.sealed && !p.empty) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.displayTitle} ${p.tagline} ${p.description} ${p.stack.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [collection, filter, query]);

  const revealedCount = collection.filter((p) => unlocked.has(p.id)).length;

  // Only the first batch renders; the rest reveal via "Show more".
  const rendered = visible.slice(0, shown);

  return (
    <section id="projects" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
      <div className="border-b-2 border-ink pb-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
          02 — The work
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Projects</h2>
      </div>

      {/* Repo #00 — the origin. The profile README quote lives here and nowhere else. */}
      <div className="mt-8 flex flex-col gap-4 border border-hairline bg-paper-deep px-5 py-5 sm:flex-row sm:items-center sm:gap-6">
        <EvilEye size={56} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
            Repo #00 — The origin
          </p>
          <p className="mt-1 font-display text-xl font-medium leading-snug sm:text-2xl">
            “All bangers, none public. Nazar is real, bro.”
          </p>
          <p className="mt-1 text-sm text-muted">
            From the profile README at{" "}
            <a
              href="https://github.com/AnkitBharadva/AnkitBharadva"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-2"
            >
              AnkitBharadva/AnkitBharadva
            </a>{" "}
            — the line this whole site is built on.
          </p>
        </div>
      </div>

      {/* Featured — always on show, never sealed. */}
      {featured.length > 0 && (
        <div className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
            <h3 className="font-display text-2xl font-semibold">Featured</h3>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              On show — no nazar here
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={indexOf.get(p.id) ?? 0}
                unlocked={unlocked.has(p.id)}
                alwaysUnsealed
                onUnlock={onUnlock}
                admin={admin}
                onEdit={onEditProject}
                onRemove={onRemoveProject}
              />
            ))}
          </div>
        </div>
      )}

      {/* The nazar collection — sealed until the visitor lifts the nazar. */}
      <div className="mt-14 border-t border-hairline pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3">
          <h3 className="font-display text-2xl font-semibold">The nazar collection</h3>
          <p className="font-mono text-sm text-ink-soft" aria-live="polite">
            {revealedCount} / {collection.length} revealed
          </p>
        </div>

        {/* Controls — filters, search and unlock-all all apply to the
            collection only. */}
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => applyFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                  filter === f.id
                    ? "border-ink bg-ink text-paper"
                    : "border-hairline bg-white text-ink-soft hover:border-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="mx-1 hidden h-4 w-px bg-hairline sm:block" />
            <button
              type="button"
              onClick={onUnlockAll}
              className="border border-hairline bg-white px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-ink-soft hover:border-ink"
            >
              Remove nazar from all
            </button>
            <button
              type="button"
              onClick={onResealAll}
              className="border border-hairline bg-white px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-ink-soft hover:border-ink"
            >
              Re-seal all
            </button>
            {admin && (
              <button
                type="button"
                onClick={onAddProject}
                className="border border-accent bg-accent px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-white"
              >
                + Add project
              </button>
            )}
          </div>
          <label className="block max-w-md">
            <span className="sr-only">Search the nazar collection</span>
            <input
              type="search"
              value={query}
              onChange={(e) => applyQuery(e.target.value)}
              placeholder="Search by name, topic or stack…"
              className="w-full border border-hairline bg-white px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent"
            />
          </label>
        </div>

        {/* Grid */}
        {visible.length === 0 ? (
          <p className="mt-10 border border-dashed border-hairline px-5 py-10 text-center text-sm text-muted">
            Nothing matches that filter. Try another one — or re-seal and start again.
          </p>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {rendered.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  index={indexOf.get(p.id) ?? 0}
                  unlocked={unlocked.has(p.id)}
                  onUnlock={onUnlock}
                  admin={admin}
                  onEdit={onEditProject}
                  onRemove={onRemoveProject}
                />
              ))}
            </div>
            {visible.length > shown && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShown((s) => s + PAGE_SIZE)}
                  className="border border-ink bg-white px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  Show more
                </button>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  Showing {rendered.length} of {visible.length}
                </p>
              </div>
            )}
          </>
        )}
      </div>

    </section>
  );
}
