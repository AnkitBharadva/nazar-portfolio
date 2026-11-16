"use client";

import Link from "next/link";

/**
 * Global error page: editorial, calm, and honest — a short apology, a
 * retry, and a way home. No stack traces, no fake content.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-16 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
        Something went wrong
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
        This page could not be loaded.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
        The portfolio is still here — this page just failed to render. Try
        again, or head back to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="border border-ink bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent-deep"
        >
          Try again
        </button>
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
