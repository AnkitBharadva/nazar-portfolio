import EvilEye from "./EvilEye";

export default function Footer({ github }: { github: string }) {
  return (
    <footer className="border-t-2 border-ink">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <p className="flex items-center gap-2.5 text-sm text-ink-soft">
          <EvilEye size={26} />
          <span>
            Origin:{" "}
            <a
              href="https://github.com/AnkitBharadva/AnkitBharadva"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-2"
            >
              repo #00
            </a>{" "}
            ·{" "}
            <a
              href={github}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-2"
            >
              github.com/AnkitBharadva
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
}
