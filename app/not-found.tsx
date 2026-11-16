import Link from "next/link";

/**
 * Editorial 404 page: the same voice as the error page — a short, honest
 * note and a way back. Shown for any unknown URL, including unknown
 * project ids.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-16 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
        404 — Not found
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
        This page does not exist.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
        The link may be mistyped, or the project may have been removed. The
        rest of the portfolio is still here.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/#projects"
          className="border border-ink bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent-deep"
        >
          Browse projects
        </Link>
        <Link
          href="/"
          className="border border-ink bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
