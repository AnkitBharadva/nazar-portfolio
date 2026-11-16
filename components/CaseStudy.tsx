"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import SiteImage from "./SiteImage";
import Link from "next/link";
import type { Project } from "@/lib/types";
import type { RepoScreenshot } from "@/lib/screenshots";
import {
  getUnlockedServerSnapshot,
  getUnlockedSnapshot,
  subscribeUnlocked,
  unlockId,
} from "@/lib/unlocked";
import { isSealable } from "@/lib/tiers";
import EvilEye from "./EvilEye";
import LemonChilli from "./LemonChilli";
import Masthead from "./Masthead";
import Footer from "./Footer";

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function CaseStudy({
  project,
  index,
  total,
  prev,
  next,
  screenshots,
  profileName,
  github,
}: {
  project: Project;
  index: number;
  total: number;
  prev: Project | null;
  next: Project | null;
  screenshots: RepoScreenshot[];
  profileName: string;
  github: string;
}) {
  const unlockedList = useSyncExternalStore(
    subscribeUnlocked,
    getUnlockedSnapshot,
    getUnlockedServerSnapshot,
  );
  const isUnlocked = unlockedList.includes(project.id);
  // Only sealable projects are veiled here: collection projects whose
  // repo has no README. Featured projects always open
  // unsealed, whatever their sealed flag says.
  const veiled = isSealable(project) && !isUnlocked;

  const [ritual, setRitual] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((s: { admin?: boolean }) => setAdmin(Boolean(s.admin)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const removeNazar = () => {
    if (isUnlocked || ritual) return;
    setRitual(true);
    timer.current = setTimeout(() => {
      setRitual(false);
      // Shared store: unsealing here also unseals the card on the homepage.
      unlockId(project.id);
    }, 900);
  };

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    setAdmin(false);
  };

  // Honesty notes: each fact appears once. The notes field already states
  // the template / empty facts for folio and video_search, so the flag
  // blocks below only render when the notes do not already say it.
  const notesMention = (word: string) =>
    (project.notes ?? "").toLowerCase().includes(word);
  const showTemplateNote = project.template && !notesMention("template");
  const showEmptyNote = project.empty && !notesMention("empty");
  const hasHonestyNotes =
    Boolean(project.forkCredit) ||
    project.synthetic ||
    showTemplateNote ||
    showEmptyNote ||
    Boolean(project.notes);

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Masthead
        name={profileName}
        admin={admin}
        onSignOut={signOut}
      />
      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
          {/* Top row — always visible */}
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <Link
              href="/"
              className="font-mono text-xs text-accent underline underline-offset-2"
            >
              ← All projects
            </Link>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Case study {String(index + 1).padStart(2, "0")} / {total} ·{" "}
              {project.language ?? "—"} · {formatDate(project.updated)}
            </p>
          </div>

          {/* Header — always visible, like the card header */}
          <header className="mt-6 border-b-2 border-ink pb-6">
            <h1 className="font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
              {project.name}
            </h1>
            <p className="mt-3 font-display text-xl leading-snug text-ink-soft sm:text-2xl">
              {project.displayTitle}
            </p>
            <p className="mt-3 max-w-xl leading-relaxed text-ink-soft">
              {project.tagline}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              {project.fork ? (
                <span className="border border-accent px-2 py-0.5 font-mono text-[11px] text-accent">
                  Fork
                </span>
              ) : (
                <span className="border border-hairline px-2 py-0.5 font-mono text-[11px] text-ink-soft">
                  Original
                </span>
              )}
              {project.liveDemo && (
                <span className="border border-hairline px-2 py-0.5 font-mono text-[11px] text-ink-soft">
                  Live demo
                </span>
              )}
              {project.sealed && (
                <span className="border border-hairline px-2 py-0.5 font-mono text-[11px] text-ink-soft">
                  Sealed
                </span>
              )}
              {project.stars > 0 && (
                <span className="border border-hairline px-2 py-0.5 font-mono text-[11px] text-ink-soft">
                  ★ {project.stars}
                </span>
              )}
            </div>
          </header>

          {/* Links — always reachable, even while sealed (same rule as the cards) */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border border-hairline bg-white px-5 py-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Links
            </span>
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
          </div>

          {/* Sealed veil */}
          {veiled && (
            <div
              className={`mt-8 flex flex-col items-center gap-4 bg-veil px-6 py-14 text-center text-white ${ritual ? "ritual-shake" : ""}`}
            >
              <div className={ritual ? "ritual-eye" : ""}>
                <EvilEye size={88} glow={!ritual} />
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/70">
                Sealed by nazar
              </p>
              <p className="max-w-md text-sm leading-relaxed text-white/80">
                This case study is sealed — remove the nazar to read what the
                repo actually contains.
              </p>
              <button
                type="button"
                onClick={removeNazar}
                disabled={ritual}
                className="group mt-1 flex items-center gap-3 border border-white/40 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-70"
                aria-label={`Remove nazar from ${project.name}`}
              >
                <LemonChilli width={22} />
                {ritual ? "Removing nazar…" : "Remove nazar"}
              </button>
            </div>
          )}

          {/* Body — blurred while sealed */}
          <div className={veiled ? "sealed-body" : "unsealed-body"}>
            <section className="mt-12">
              <h2 className="border-b border-hairline pb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                Overview
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                {project.description}
              </p>
            </section>

            <section className="mt-12">
              <h2 className="border-b border-hairline pb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                Verified numbers
              </h2>
              {project.metrics.length > 0 ? (
                <dl className="mt-4 border-t border-hairline">
                  {project.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="flex flex-col gap-0.5 border-b border-hairline py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                    >
                      <dt className="text-sm text-ink-soft">{m.label}</dt>
                      <dd className="font-mono text-base font-semibold sm:text-right">
                        {m.value}{" "}
                        <span className="font-sans text-xs font-normal text-muted">
                          ({m.source})
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  No measured numbers in the repo — none are claimed here.
                </p>
              )}
            </section>

            {screenshots.length > 0 && (
              <section className="mt-12">
                <h2 className="border-b border-hairline pb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                  From the repo
                </h2>
                <div className="mt-4 space-y-8">
                  {screenshots.map((shot) => (
                    <figure key={shot.src}>
                      <div className="border border-hairline bg-white p-2">
                        <SiteImage
                          preset="screenshot"
                          src={shot.src}
                          alt={shot.caption}
                          width={shot.width}
                          height={shot.height}
                          className="h-auto w-full"
                        />
                      </div>
                      <figcaption className="mt-2 font-mono text-[11px] leading-relaxed text-muted">
                        {shot.caption}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-12">
              <h2 className="border-b border-hairline pb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                Stack
              </h2>
              {project.stack.length > 0 ? (
                <>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {project.stack.map((s) => (
                      <li
                        key={s}
                        className="border border-hairline bg-white px-2 py-0.5 font-mono text-[11px] text-ink-soft"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-muted">
                    Primary language: {project.language ?? "—"}
                  </p>
                </>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  No stack recorded — the repository is empty.
                </p>
              )}
            </section>

            <section className="mt-12">
              <h2 className="border-b border-hairline pb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                Repo facts
              </h2>
              <dl className="mt-4 border-t border-hairline">
                <div className="flex flex-col gap-0.5 border-b border-hairline py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <dt className="text-sm text-ink-soft">Files in repo</dt>
                  <dd className="font-mono text-sm font-semibold">
                    {project.files}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-hairline py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <dt className="text-sm text-ink-soft">Stars</dt>
                  <dd className="font-mono text-sm font-semibold">
                    ★ {project.stars}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-hairline py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <dt className="text-sm text-ink-soft">Last updated</dt>
                  <dd className="font-mono text-sm font-semibold">
                    {formatDate(project.updated)}
                  </dd>
                </div>
              </dl>
            </section>

            {hasHonestyNotes && (
              <section className="mt-12">
                <h2 className="border-b border-hairline pb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                  Honesty notes
                </h2>
                <div className="mt-4 space-y-3">
                  {project.forkCredit && (
                    <p className="border-l-2 border-accent bg-paper-deep px-3 py-2 text-xs leading-relaxed text-ink-soft">
                      {project.forkCredit}
                    </p>
                  )}
                  {project.synthetic && (
                    <p className="border-l-2 border-gold bg-paper-deep px-3 py-2 text-xs leading-relaxed text-ink-soft">
                      Built on synthetic data — the PaySim dataset simulates
                      mobile-money transactions; it is not real UPI data.
                    </p>
                  )}
                  {showTemplateNote && (
                    <p className="border-l-2 border-gold bg-paper-deep px-3 py-2 text-xs leading-relaxed text-ink-soft">
                      Template-based — built on a template, not an original
                      design.
                    </p>
                  )}
                  {showEmptyNote && (
                    <p className="border-l-2 border-gold bg-paper-deep px-3 py-2 text-xs leading-relaxed text-ink-soft">
                      Verified empty — this repository contains no files.
                    </p>
                  )}
                  {project.notes && (
                    <p className="text-xs leading-relaxed text-muted">
                      {project.notes}
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Prev / next — always reachable */}
          <nav
            className="mt-16 grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2"
            aria-label="More case studies"
          >
            {prev ? (
              <Link href={`/projects/${prev.id}`} className="group bg-white px-5 py-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  ← Previous
                </span>
                <span className="mt-1 block font-display text-lg font-semibold leading-snug group-hover:text-accent">
                  {prev.name}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-muted">
                  {prev.displayTitle}
                </span>
              </Link>
            ) : (
              <Link href="/" className="group bg-paper-deep px-5 py-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  ← Start of the list
                </span>
                <span className="mt-1 block font-display text-lg font-semibold leading-snug group-hover:text-accent">
                  All projects
                </span>
              </Link>
            )}
            {next ? (
              <Link
                href={`/projects/${next.id}`}
                className="group bg-white px-5 py-4 sm:text-right"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  Next →
                </span>
                <span className="mt-1 block font-display text-lg font-semibold leading-snug group-hover:text-accent">
                  {next.name}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-muted">
                  {next.displayTitle}
                </span>
              </Link>
            ) : (
              <Link href="/" className="group bg-paper-deep px-5 py-4 sm:text-right">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  End of the list →
                </span>
                <span className="mt-1 block font-display text-lg font-semibold leading-snug group-hover:text-accent">
                  All projects
                </span>
              </Link>
            )}
          </nav>
        </article>
      </main>
      <Footer github={github} />
    </div>
  );
}
