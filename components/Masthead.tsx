"use client";

import Link from "next/link";
import EvilEye from "./EvilEye";

export default function Masthead({
  name,
  admin,
  onSignOut,
}: {
  name: string;
  admin: boolean;
  onSignOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-5 py-3 sm:px-8">
        <Link href="/#top" className="flex min-w-0 items-center gap-2.5" aria-label="Back to top">
          <EvilEye size={34} className="shrink-0" />
          <span className="truncate font-display text-base font-semibold leading-none sm:text-lg">{name}</span>
        </Link>
        <nav className="ml-auto flex shrink-0 items-center gap-4 sm:gap-6" aria-label="Sections">
          <Link
            href="/#about"
            className="hidden font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-ink sm:inline"
          >
            About
          </Link>
          <Link
            href="/#projects"
            className="hidden font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-ink sm:inline"
          >
            Projects
          </Link>
          <Link
            href="/#experience"
            className="hidden font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-ink sm:inline"
          >
            Experience
          </Link>
          <Link
            href="/#achievements"
            className="hidden font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-ink sm:inline"
          >
            Achievements
          </Link>
          <Link
            href="/#connect"
            className="hidden font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-ink sm:inline"
          >
            Connect
          </Link>
          {/* No sign-in button for visitors: the admin entry is the secret
              /nazar link, so nobody can even see there's a door. The badge
              and sign-out below only ever render on an admin session. */}
          {admin && (
            <span className="flex items-center gap-3">
              <span className="border border-accent px-2 py-1 font-mono text-[11px] uppercase tracking-widest text-accent">
                Admin
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="font-mono text-xs uppercase tracking-widest text-ink-soft underline underline-offset-2 hover:text-ink"
              >
                Sign out
              </button>
            </span>
          )}
        </nav>
      </div>
      {/* Mobile section nav — the desktop links are hidden below sm, so
          phones get their own compact row instead of no navigation. */}
      <nav className="border-t border-hairline sm:hidden" aria-label="Sections">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-5 py-2">
          <Link
            href="/#about"
            className="py-1 font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-ink"
          >
            About
          </Link>
          <Link
            href="/#projects"
            className="py-1 font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-ink"
          >
            Projects
          </Link>
          <Link
            href="/#experience"
            className="py-1 font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-ink"
          >
            Experience
          </Link>
          <Link
            href="/#achievements"
            className="py-1 font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-ink"
          >
            Achievements
          </Link>
          <Link
            href="/#connect"
            className="py-1 font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-ink"
          >
            Connect
          </Link>
        </div>
      </nav>
    </header>
  );
}
