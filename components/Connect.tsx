import Link from "next/link";
import type { Profile } from "@/lib/types";

/** Format an Indian mobile as +91 99257 99480; anything else passes through. */
function displayPhone(phone: string): string {
  const match = phone.match(/^\+91(\d{5})(\d{5})$/);
  return match ? `+91 ${match[1]} ${match[2]}` : phone;
}

const chipCls =
  "border border-ink bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent";

/**
 * Email-first Connect section: the email address is the hero action (big,
 * clickable), and everything else is a compact chip — short labels, no
 * raw URLs on display. Chips render only for contact details that are
 * actually set; clearing one in admin removes its chip.
 */
export default function Connect({ profile }: { profile: Profile }) {
  const email = profile.email ?? "";
  const phone = profile.phone ?? "";
  const resumeHref = profile.resumeUrl ?? "/resume";

  const chips: { label: string; href: string; external: boolean }[] = [];
  if (profile.github) {
    chips.push({ label: "GitHub", href: profile.github, external: true });
  }
  if (profile.kaggle) {
    chips.push({ label: "Kaggle", href: profile.kaggle, external: true });
  }
  if (profile.huggingface) {
    chips.push({ label: "Hugging Face", href: profile.huggingface, external: true });
  }
  if (profile.linkedin) {
    chips.push({ label: "LinkedIn", href: profile.linkedin, external: true });
  }
  if (phone) {
    chips.push({ label: displayPhone(phone), href: `tel:${phone}`, external: false });
  }

  return (
    <section id="connect">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="border-b-2 border-ink pb-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
            05 — Connect
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Let&rsquo;s talk.
          </h2>
        </div>

        <p className="mt-6 max-w-xl leading-relaxed text-ink-soft">
          Chai + code + conversation. My inbox is open for all three.
        </p>

        {email && (
          <div className="mt-8">
            <a
              href={`mailto:${email}`}
              className="break-all font-display text-2xl font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-deep sm:text-3xl"
            >
              {email}
            </a>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {chips.map((chip) => (
            <a
              key={chip.label}
              href={chip.href}
              {...(chip.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className={chipCls}
            >
              {chip.label}
              {chip.external ? " ↗" : ""}
            </a>
          ))}
          {profile.resumeUrl ? (
            <a
              href={resumeHref}
              target="_blank"
              rel="noreferrer"
              className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent-deep"
            >
              Resume ↗
            </a>
          ) : (
            <Link
              href="/resume"
              className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent-deep"
            >
              Resume
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
