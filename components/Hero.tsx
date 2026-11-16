"use client";

import { Fragment } from "react";
import Link from "next/link";
import SiteImage from "./SiteImage";
import type { Profile } from "@/lib/types";
import EvilEye from "./EvilEye";
import NazarBattu from "./NazarBattu";

/** Split the name into per-letter spans for the load reveal. Words stay
    together (inline-block, no wrap) with a real space between them, so
    the name never breaks mid-word. The H1 carries the full name as its
    aria-label and the word spans are aria-hidden, so screen readers
    hear one name instead of thirteen letters. Letters stagger 40ms
    apart; the whole name is done in ~1s, then static. */
function NameLetters({ name }: { name: string }) {
  let index = 0;
  const words = name.split(" ");
  return (
    <>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span aria-hidden="true" className="name-word">
            {[...word].map((ch) => {
              const delay = index * 40;
              index += 1;
              return (
                <span
                  key={`${wi}-${index}`}
                  className="name-letter"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

export default function Hero({
  profile,
  stats,
  swingKey,
  admin,
  onEditProfile,
}: {
  profile: Profile;
  stats: { label: string; value: string }[];
  swingKey: number;
  admin: boolean;
  onEditProfile: () => void;
}) {

  return (
    <section id="about" className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
      {/* Liquid ripple filter for the hero photo: fractal-noise turbulence
          displaces the image by a few pixels, and the base frequency
          drifts slowly so the water reads as moving. Scale 5 is small
          enough that the face barely moves — the eye catches the motion
          in the textured water and foam, not on smooth skin or sky.
          Desktop photo only; the mobile thumb is too small for it and
          mobile GPUs pay the filter cost for nothing. */}
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <defs>
          <filter id="photo-ripple" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.02"
              numOctaves="2"
              seed="7"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="16s"
                values="0.012 0.02; 0.016 0.026; 0.012 0.02"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[auto_minmax(0,5fr)_minmax(0,4fr)] lg:gap-14">
        {/* Battu rail, leftmost: the battu hangs from a short rod at the
            page's left edge, with the name and intro in the middle column
            and the photo on the right. The rail is desktop-only; on
            mobile the hero is just the thumb + name. */}
        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="h-px w-32 bg-ink" />
          <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2">
            <div className="battu-bob">
              <NazarBattu swingKey={swingKey} caption={false} />
            </div>
          </div>
        </div>

        {/* Text column — name, intro, interests, actions, stats. */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
            01 — About
          </p>
            {/* Mobile profile header: small portrait beside the name. On
                desktop this is a plain block and the portrait is hidden —
                the large framed photo column carries the portrait there. */}
            <div className="mt-3 flex items-center gap-4 lg:block">
              <div className="relative shrink-0 border border-hairline bg-white p-1 lg:hidden">
                <div className="overflow-hidden">
                  <SiteImage
                    preset="thumb"
                    src={profile.photo}
                    alt={`Portrait of ${profile.name}`}
                    width={128}
                    height={160}
                    className="photo-drift aspect-[4/5] w-24 object-cover sm:w-32"
                    priority
                  />
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <EvilEye size={28} glow />
                </div>
              </div>
              <h1
                aria-label={profile.name}
                className="min-w-0 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl"
              >
                <NameLetters name={profile.name} />
              </h1>
            </div>
            <p
              className="fade-up mt-4 max-w-xl leading-relaxed text-ink-soft"
              style={{ animationDelay: "100ms" }}
            >
              {profile.bio}
            </p>

            <ul
              className="fade-up mt-6 flex flex-wrap gap-2"
              style={{ animationDelay: "250ms" }}
              aria-label="Interests"
            >
              {profile.interests.map((interest) => (
                <li
                  key={interest}
                  className="border border-hairline bg-white px-2.5 py-1 font-mono text-xs text-ink-soft"
                >
                  {interest}
                </li>
              ))}
            </ul>

            <div
              className="fade-up mt-8 flex flex-wrap gap-3"
              style={{ animationDelay: "400ms" }}
            >
              <a
                href="#projects"
                className="border border-ink bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent-deep"
              >
                View projects
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="border border-ink bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
              >
                GitHub ↗
              </a>
              {profile.resumeUrl ? (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-ink bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  Resume ↗
                </a>
              ) : (
                <Link
                  href="/resume"
                  className="border border-ink bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  Resume
                </Link>
              )}
              {admin && (
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="border border-dashed border-accent px-5 py-2.5 text-sm font-medium text-accent"
                >
                  Edit about
                </button>
              )}
            </div>

            {/* At-a-glance stats — derived from the data, shown here only */}
            <dl
              className="fade-up mt-10 grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-4"
              style={{ animationDelay: "550ms" }}
            >
              {stats.map((s) => (
                <div key={s.label} className="bg-white px-4 py-3">
                  <dd className="font-display text-2xl font-semibold">{s.value}</dd>
                  <dt className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
        </div>

        {/* Photo column — desktop only, clean frame, no hanging battu.
            On mobile the small portrait beside the name carries the photo. */}
        <div className="mx-auto hidden w-full max-w-sm lg:mx-0 lg:block lg:justify-self-end">
          <div className="relative border border-hairline bg-white p-2">
            <div className="overflow-hidden">
              <SiteImage
                preset="hero"
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                width={768}
                height={1024}
                className="photo-ripple photo-drift aspect-[3/4] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-2">
              <EvilEye size={44} glow />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
