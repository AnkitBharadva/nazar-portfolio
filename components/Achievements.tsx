"use client";

import SiteImage from "./SiteImage";
import type { Achievement } from "@/lib/types";

function isPdf(url: string): boolean {
  return url.toLowerCase().endsWith(".pdf");
}

export default function Achievements({
  achievements,
  admin,
  onAdd,
  onEdit,
  onRemove,
}: {
  achievements: Achievement[];
  admin: boolean;
  onAdd: () => void;
  onEdit: (achievement: Achievement) => void;
  onRemove: (achievement: Achievement) => void;
}) {
  return (
    <section
      id="achievements"
      className="border-y border-hairline bg-paper-deep/60"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
              04 — Honours
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Achievements
            </h2>
          </div>
          {admin && (
            <button
              type="button"
              onClick={onAdd}
              className="border border-accent bg-accent px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-white"
            >
              + Add achievement
            </button>
          )}
        </div>

        {achievements.length === 0 ? (
          <p className="mt-8 text-sm text-muted">No achievements published yet.</p>
        ) : (
          <ol className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            {achievements.map((a) => (
              <li key={a.id} className="flex flex-col border border-hairline bg-white">
                <div className="flex items-start gap-4 px-5 py-5">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold font-display text-xl text-gold"
                  >
                    ★
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                      {a.year}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold leading-tight">
                      {a.title} — {a.event}
                    </h3>
                    {a.description && (
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                        {a.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Certificate — honest empty state until the admin uploads one */}
                <div className="border-t border-hairline px-5 py-4">
                  {a.certificateUrl ? (
                    isPdf(a.certificateUrl) ? (
                      <a
                        href={a.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-accent underline underline-offset-2"
                      >
                        View certificate (PDF) ↗
                      </a>
                    ) : (
                      <a href={a.certificateUrl} target="_blank" rel="noreferrer">
                        <SiteImage
                          preset="certificate"
                          src={a.certificateUrl}
                          alt={`Certificate for ${a.title}, ${a.event} ${a.year}`}
                          width={800}
                          height={560}
                          className="w-full border border-hairline object-cover"
                        />
                      </a>
                    )
                  ) : (
                    <p className="font-mono text-xs text-muted">
                      Certificate — not added yet.
                    </p>
                  )}
                </div>

                {admin && (
                  <div className="flex gap-2 border-t border-dashed border-hairline bg-paper-deep px-5 py-2">
                    <button
                      type="button"
                      onClick={() => onEdit(a)}
                      className="font-mono text-[11px] uppercase tracking-widest text-accent underline underline-offset-2"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(a)}
                      className="font-mono text-[11px] uppercase tracking-widest text-red-800 underline underline-offset-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
