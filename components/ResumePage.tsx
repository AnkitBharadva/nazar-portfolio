"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Project, SiteData } from "@/lib/types";
import Masthead from "./Masthead";
import Footer from "./Footer";

/** Short display form of a URL: no protocol, no trailing slash. */
function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * Fork label for a resume line. Forks are always labelled; when the
 * repo's own credit names the original builder, that name is shown —
 * kiwiq's README credits Raunak Bhandari, so it reads as his build,
 * never as Ankit's.
 */
function forkLabel(p: Project): string | null {
  if (!p.fork) return null;
  if ((p.forkCredit ?? "").includes("Raunak Bhandari")) {
    return "Fork — built by Raunak Bhandari";
  }
  return "Fork";
}

function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="resume-section mt-10 border-t-2 border-ink pt-4">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ResumePage({ data }: { data: SiteData }) {
  const { profile, projects, achievements, experience } = data;
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((s: { admin?: boolean }) => setAdmin(Boolean(s.admin)))
      .catch(() => undefined);
  }, []);

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    setAdmin(false);
  };

  const email = profile.email ?? "";
  const phone = profile.phone ?? "";
  const kaggle = profile.kaggle ?? "";
  const linkedin = profile.linkedin ?? "";

  // Languages actually used across the repos, derived from the data.
  const languages = [...new Set(projects.map((p) => p.language).filter(Boolean))].sort() as string[];

  const contactParts: React.ReactNode[] = [];
  if (email) {
    contactParts.push(
      <a key="email" href={`mailto:${email}`} className="text-accent underline underline-offset-2">
        {email}
      </a>,
    );
  }
  if (phone) {
    contactParts.push(
      <a key="phone" href={`tel:${phone}`} className="text-accent underline underline-offset-2">
        {phone}
      </a>,
    );
  }
  if (profile.github) {
    contactParts.push(
      <a
        key="github"
        href={profile.github}
        target="_blank"
        rel="noreferrer"
        className="text-accent underline underline-offset-2"
      >
        {displayUrl(profile.github)}
      </a>,
    );
  }
  if (kaggle) {
    contactParts.push(
      <a
        key="kaggle"
        href={kaggle}
        target="_blank"
        rel="noreferrer"
        className="text-accent underline underline-offset-2"
      >
        {displayUrl(kaggle)}
      </a>,
    );
  }
  if (linkedin) {
    contactParts.push(
      <a
        key="linkedin"
        href={linkedin}
        target="_blank"
        rel="noreferrer"
        className="text-accent underline underline-offset-2"
      >
        {displayUrl(linkedin)}
      </a>,
    );
  }

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Masthead
        name={profile.name}
        admin={admin}
        onSignOut={signOut}
      />
      <main className="flex-1">
        <article className="resume-sheet mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
          {/* Screen-only actions — hidden in print (see globals.css). */}
          <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-widest text-accent underline underline-offset-2"
            >
              ← Back to portfolio
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent-deep"
            >
              Download PDF
            </button>
          </div>

          {/* Header */}
          <header>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
              {profile.fullName}
            </h1>
            {contactParts.length > 0 && (
              <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
                {contactParts.map((part, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && (
                      <span aria-hidden="true" className="text-muted">
                        •
                      </span>
                    )}
                    {part}
                  </span>
                ))}
              </p>
            )}
          </header>

          {/* Education — stated facts only: no graduation year (unknown). */}
          <ResumeSection title="Education">
            <div className="resume-entry">
              <h3 className="font-display text-lg font-semibold leading-snug">
                B.E. Computer Engineering
              </h3>
              <p className="mt-0.5 text-sm text-ink-soft">
                Gujarat Technological University, Ahmedabad — 3rd year (Semester 5)
              </p>
            </div>
          </ResumeSection>

          {/* Experience — verified roles only; the description is what was
              actually done, never padded. */}
          {experience.length > 0 && (
            <ResumeSection title="Experience">
              <ol className="flex flex-col gap-4">
                {experience.map((e) => (
                  <li key={e.id} className="resume-entry">
                    <h3 className="font-display text-base font-semibold leading-snug">
                      {e.role} —{" "}
                      {e.companyUrl ? (
                        <a
                          href={e.companyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent underline underline-offset-2"
                        >
                          {e.company}
                        </a>
                      ) : (
                        e.company
                      )}
                      <span className="ml-2 font-mono text-xs font-normal text-muted">
                        {e.period}
                        {e.duration ? ` · ${e.duration}` : ""}
                      </span>
                    </h3>
                    {e.location && (
                      <p className="mt-0.5 text-sm text-ink-soft">{e.location}</p>
                    )}
                    {e.description && (
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {e.description}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </ResumeSection>
          )}

          {/* Skills — the five stated interests plus the languages the
              repos actually use. */}
          <ResumeSection title="Skills">
            <div className="resume-entry">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                Focus
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">{profile.interests.join(" · ")}</p>
            </div>
            {languages.length > 0 && (
              <div className="resume-entry mt-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  Languages in the repos
                </p>
                <p className="mt-1.5 text-sm leading-relaxed">{languages.join(" · ")}</p>
              </div>
            )}
          </ResumeSection>

          {/* Projects — every project, one line each, in site order. */}
          <ResumeSection title={`Projects — ${projects.length}`}>
            <ol className="flex flex-col gap-2.5">
              {projects.map((p) => {
                const label = forkLabel(p);
                return (
                  <li key={p.id} className="resume-entry text-sm leading-relaxed">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-ink-soft"> — {p.tagline}</span>
                    {label && (
                      <span className="ml-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
                        ({label})
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </ResumeSection>

          {/* Achievements — descriptions render only when filled in. */}
          {achievements.length > 0 && (
            <ResumeSection title="Achievements">
              <ol className="flex flex-col gap-4">
                {achievements.map((a) => (
                  <li key={a.id} className="resume-entry">
                    <h3 className="font-display text-base font-semibold leading-snug">
                      {a.title} — {a.event}
                      <span className="ml-2 font-mono text-xs font-normal text-muted">
                        {a.year}
                      </span>
                    </h3>
                    {a.description && (
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {a.description}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </ResumeSection>
          )}
        </article>
      </main>
      <Footer github={profile.github} />
    </div>
  );
}
