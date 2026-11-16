import LemonChilli from "./LemonChilli";

/**
 * The nazar concept, stated exactly once on the page.
 * (The tagline itself lives only in the Repo #00 origin block.)
 */
export default function ConceptStrip() {
  return (
    <section aria-label="How this portfolio works" className="bg-veil text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-5 py-10 sm:flex-row sm:items-center sm:gap-8 sm:px-8">
        <div className="shrink-0">
          <LemonChilli width={96} />
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold leading-snug sm:text-3xl">
            Four projects on show. The rest stay sealed until you remove the nazar.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">
            The nazar collection below starts sealed behind the evil eye. Click the
            lemon-chilli, the nazar lifts, and the case study opens.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white">
            Built by the guy who ships.
          </p>
        </div>
      </div>
    </section>
  );
}
