"use client";

import type { Experience } from "@/lib/types";

export default function ExperienceSection({
  experience,
  admin,
  onAdd,
  onEdit,
  onRemove,
}: {
  experience: Experience[];
  admin: boolean;
  onAdd: () => void;
  onEdit: (entry: Experience) => void;
  onRemove: (entry: Experience) => void;
}) {
  return (
    <section id="experience" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
            03 — Experience
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Experience
          </h2>
        </div>
        {admin && (
          <button
            type="button"
            onClick={onAdd}
            className="border border-accent bg-accent px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-white"
          >
            + Add experience
          </button>
        )}
      </div>

      {experience.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No experience published yet.</p>
      ) : (
        <ol className="mt-8 border-t border-hairline">
          {experience.map((entry) => (
            <li key={entry.id} className="border-b border-hairline py-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                <div className="w-44 shrink-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                    {entry.period}
                  </p>
                  {entry.duration && (
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                      {entry.duration}
                    </p>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl font-semibold leading-tight">
                    {entry.role} —{" "}
                    {entry.companyUrl ? (
                      <a
                        href={entry.companyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent underline underline-offset-2 hover:text-accent-deep"
                      >
                        {entry.company} ↗
                      </a>
                    ) : (
                      entry.company
                    )}
                  </h3>
                  {entry.location && (
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                      {entry.location}
                    </p>
                  )}
                  {entry.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                      {entry.description}
                    </p>
                  )}
                </div>
              </div>

              {admin && (
                <div className="mt-4 flex gap-2 border-t border-dashed border-hairline bg-paper-deep px-5 py-2">
                  <button
                    type="button"
                    onClick={() => onEdit(entry)}
                    className="font-mono text-[11px] uppercase tracking-widest text-accent underline underline-offset-2"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(entry)}
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
    </section>
  );
}
