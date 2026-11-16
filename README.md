# Nazar-Proof Portfolio — Ankit Bharadva

A real, deployable Next.js (App Router + TypeScript + Tailwind CSS) portfolio
for Ankit Bharadva. Four featured projects are on show at once; the rest of
the work sits in the nazar collection, sealed behind an evil-eye veil that
the visitor removes with a lemon-chilli ritual to read the case study.

Content: 23 projects covering all of Ankit's public GitHub repos, in two
tiers — 4 Featured (always visible, never sealed) and 19 in the nazar
collection (sealed until revealed, including the 5 forks, the empty
repo and the template-based portfolio, all labelled and credited on
their cards) — plus the profile repo as repo #00 ("All bangers, none
public. Nazar is real, bro."), an About hero with photo and bio, and 2
achievements. Every project claim was transcribed from a repo-by-repo
audit (14 Nov 2026): numbers are labelled with their source ("per
README" / "verified in repo" / "repo docs"), all 5 forks are labelled
and credited (KiwiQ was built by Raunak Bhandari — it is a fork, never
presented as Ankit's), jiraba's PaySim data is flagged as synthetic
(not real UPI transactions), ProjectArgus claims no results, folio is
disclosed as template-based, and video_search is shown as verified
empty.

## Project tiers

- **Featured** — `featured: true` in `data/projects.json`. Always visible,
  never sealed, on the card or the case study. Only a few projects should
  ever carry the flag; toggle it from the admin project form.
- **The nazar collection** — everything that is not featured: 19 projects,
  including the 5 forks, the empty repo and the template-based portfolio,
  which stay labelled and credited on their cards and case studies. Sealed
  behind the veil until the visitor removes the nazar; filters, search,
  "Show more" and unlock-all / re-seal-all all apply to the collection
  only, and the reveal counter reads "X / 19 revealed". A case study is
  veiled only for collection projects with `sealed: true` (no README in
  the repo); featured case studies always open unsealed, whatever their
  `sealed` flag says. The tier rules live in `lib/tiers.ts` and are shared
  by the section, the case studies and the per-project OG images.

## Run locally

```bash
npm install
cp .env.example .env.local
# Edit .env.local and set a real ADMIN_PASSCODE
npm run dev
```

Open http://localhost:3000. Visitors browse with no login.

## Admin

There is no Admin button anywhere on the site. To sign in, open the
secret link — `/nazar` on your deployed domain (locally,
http://localhost:3000/nazar) — and enter the `ADMIN_PASSCODE` from your
environment. The page is not linked from anywhere, not in the sitemap,
and `noindex`, so visitors and search engines never see it. The
passcode is still the real lock; the hidden link only hides the door.
Signed in, you can:

- Add, edit and remove projects (name, links, description, metrics with
  sources, stack, featured/fork/sealed/empty/template/synthetic flags)
- Edit the About profile (name, bio, interests, GitHub URL)
- Add, edit and remove achievements, and upload certificate images
  (JPG, PNG, WebP, GIF or PDF, max 10 MB — images are optimized
  automatically on upload, see "Performance" below)
- Add, edit and remove experience entries (company, role, period,
  duration, location, description)

Visitors never see admin controls. The passcode is checked server-side and
the session lives in a signed, httpOnly cookie.

## Push to GitHub

```bash
cd nazar-portfolio
git init
git add .
git commit -m "Nazar-Proof Portfolio"
gh repo create nazar-portfolio --public --source=. --remote=origin --push
```

If you prefer to create the repo on github.com first, then:

```bash
git remote add origin https://github.com/AnkitBharadva/nazar-portfolio.git
git branch -M main
git push -u origin main
```

`.env.local` is git-ignored — secrets never go into the repo. (This workspace
has no logged-in `gh`, so the push is yours to run.)

## Deploy to Vercel

1. On [vercel.com](https://vercel.com), **Add New → Project → Import** the
   `nazar-portfolio` repo. Framework preset: Next.js. Leave the build
   settings as detected.
2. In the project settings, add these **Environment Variables**:
   - `ADMIN_PASSCODE` — your admin passcode (required for admin sign-in).
   - `SESSION_SECRET` — a long random string (recommended).
   - `NEXT_PUBLIC_SITE_URL` — the public URL of the deployed site
     (e.g. `https://your-portfolio.vercel.app`). Required for correct
     sitemap, canonical and link-preview URLs — see [SEO](#seo).
   - For persistent admin edits, also add the GitHub-mode variables below.
3. Click **Deploy**. Vercel redeploys automatically on every push to `main`.

## How admin persistence works

There are two storage modes, chosen automatically from the environment:

- **File mode (default)** — data lives in `data/*.json` in the repo and
  uploads go to `public/uploads/`. Uploaded files are served through the
  `/api/uploads/[name]` route (files written to `public/` after the build
  are not picked up by `next start`, so they are read from disk by the
  route instead). This works locally and on any Node server where the app
  can write to its own disk.
- **GitHub mode** — enabled when `GITHUB_TOKEN`, `GITHUB_OWNER` and
  `GITHUB_REPO` are set (optional `GITHUB_BRANCH`, default `main`). Admin
  writes commit the JSON files and uploaded images back to the repo via
  the GitHub Contents API (read SHA, then PUT), so edits persist and
  Vercel redeploys automatically. The token needs `contents: write` on
  this repo — a fine-grained personal access token scoped to the repo is
  enough. Reads fall back to the local files if the GitHub API is
  unreachable, so the public site never goes down because of an API error.
  Because the live site reads its data from the GitHub API in this mode,
  edits show up immediately — no redeploy wait for content changes.

> **Honest note about Vercel:** on Vercel's serverless hosting the
> filesystem is ephemeral — in file mode, an admin edit writes to a
> function instance's temporary disk and is lost on the next deploy or
> instance recycle, and uploaded files are never served (they are not
> part of the deployment). **Use GitHub mode on Vercel** — it is the
> persistent path there. File mode is for local development and for
> traditional Node servers with a writable disk.

## Performance

The site is built to stay fast as it grows — more projects, more images,
more detail. These guardrails are in the code, so future edits stay fast
by default:

- **Upload-time image optimization** (`lib/optimizeImage.ts`) — every
  image upload is processed before it is stored, in both storage modes:
  JPEG/PNG/WebP are capped at 1600px on the longest side and re-encoded
  in the same format at quality 80; if the result is still over ~1 MB a
  second pass caps at 1200px and quality 70. GIFs (animation) and PDFs
  are stored untouched. The 10 MB input cap still applies, and if
  optimization ever fails the original file is stored instead — an
  upload never breaks because of it.
- **One image component** (`components/SiteImage.tsx`) — every image on
  the site goes through this wrapper around `next/image`: lazy loading
  unless `priority`, `decoding="async"`, and named `sizes` presets
  (`hero` / `card` / `certificate` / `screenshot`) instead of free-form
  strings. Add new images through it and the rules follow automatically.
  Images are served as AVIF/WebP where supported (see `next.config.ts`).
- **Progressive rendering** (`components/ProjectsSection.tsx`) — the
  nazar collection renders only the first 9 cards, with a "Show more"
  control revealing the rest in batches of 9. The full project data stays
  in memory, so search, filters, the reveal counter, unlock-all and
  re-seal-all all work across every collection project. Project cards also
  carry `content-visibility: auto` (`globals.css`), so off-screen cards
  skip layout and paint until scrolled into view.
- **Error + not-found states** — `app/error.tsx` is a calm error page
  with a retry and a way home, and `app/not-found.tsx` is the editorial
  404 page used for unknown URLs and unknown project ids.
  Deliberately, there are NO `loading.tsx` files: a loading boundary
  streams the page shell with a 200 status before the case-study page
  renders, so an unknown project id would return a soft 404 (not-found
  UI, 200 status) instead of a real 404. Verified 15 Nov 2026 — do not
  re-add loading skeletons without re-checking the 404 status.
- **Caching** — uploaded files have timestamp-prefixed, unique filenames
  (`lib/store.ts`), so `/api/uploads/*` responses are cached immutably
  for a year. `/api/data` is deliberately uncached, and both pages are
  `force-dynamic`, so admin edits show immediately.

## SEO

- **Site URL** (`lib/siteUrl.ts`) — every absolute URL the site emits
  (sitemap, robots.txt, canonical links, OG URLs, JSON-LD) derives from
  `NEXT_PUBLIC_SITE_URL`, defaulting to `http://localhost:3000` for local
  development. **Set it on Vercel to the real deployed domain** — until
  then the sitemap and link previews point at localhost. No domain is
  invented anywhere in the code.
- **Metadata** (`app/layout.tsx`, `app/projects/[id]/page.tsx`) — title,
  description, canonical URL, Open Graph (site name, locale `en_IN`,
  `website` on the homepage, `article` on case studies) and a
  `summary_large_image` Twitter card on every page. No Twitter handle
  is claimed — he has none on record.
- **Sitemap** (`app/sitemap.ts`) — homepage (priority 1.0), the resume
  page (0.8), plus one entry per project (0.8), read live from the data
  store so admin-added projects appear automatically. Each project's
  `lastModified` comes from its `updated` field, but only when it
  parses as a real date.
- **Robots** (`app/robots.ts`) — everything crawlable except `/api/`
  (data endpoints, not page content), with the sitemap referenced.
- **Link-preview images** (`app/opengraph-image.tsx`,
  `app/projects/[id]/opengraph-image.tsx`, `components/OgCard.tsx`) —
  1200×630 cards drawn with `ImageResponse`: ink-dark background, gold
  accent, and the evil-eye motif in nested circles. The homepage card
  is prerendered at build time; per-project cards render on demand
  (Node runtime, they read the data store) and fall back to the generic
  card for unknown ids — the route never errors.
- **Structured data** (`app/page.tsx`) — Person + WebSite JSON-LD on the
  homepage, verified facts only: name, site URL, public profiles
  (GitHub, Kaggle, LinkedIn — only the ones actually set),
  "Computer Engineering Student", and the five stated interests.

## Resume + Connect

- **Connect** (`components/Connect.tsx`) — homepage section after
  Achievements: the email address is the hero action (large, clickable)
  and GitHub, Kaggle, LinkedIn, phone and Resume are compact chips with
  short labels — no raw URLs on display. Chips render only for details
  that are set; the contact fields live in `profile.json` and are
  editable from the admin Edit About form.
- **Resume** (`app/resume/`, `components/ResumePage.tsx`) — a CV
  generated from the site's own data: education (B.E. Computer
  Engineering, GTU Ahmedabad, 3rd year — no graduation year, unknown),
  skills (the five interests plus the languages the repos use), all
  projects one line each (forks labelled; kiwiq credited to Raunak
  Bhandari), and both achievements. "Download PDF" prints the page
  (`window.print()`); the `@media print` rules in `globals.css` hide
  the masthead, footer and buttons and set clean serif type.
- **Custom resume override** — the admin Edit About form accepts a
  resume PDF upload (stored via the existing upload API). When set,
  the Resume buttons (hero + Connect) link straight to that file; the
  generated `/resume` page stays available regardless.

## Scripts

| Command         | What it does                              |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Start the development server              |
| `npm run build` | Type-check, lint and build for production |
| `npm run start` | Start the production server               |
| `npm run lint`  | Run ESLint                                |

## Project layout

```
app/                  Next.js App Router: page, layout, API routes
  api/data/           Public read endpoint (profile + projects + achievements
                      + experience)
  api/admin/          Login / logout / session, project + profile +
                      achievement + experience CRUD, certificate upload
  projects/[id]/      Case study page per project (dynamic — admin-added
                      projects get pages automatically) + per-project
                      OG image
  resume/             CV generated from the site data + print-to-PDF
  nazar/              Secret admin entry: homepage with sign-in open,
                      noindex, not in the sitemap or robots.txt
  sitemap.ts          Homepage + resume + one entry per project (dynamic)
  robots.ts           Allow all except /api/, sitemap referenced
  opengraph-image.tsx Homepage link-preview card (1200×630)
components/           Masthead, Hero, Achievements, Experience, Connect,
                      ConceptStrip, ProjectsSection, ProjectCard, CaseStudy,
                      ResumePage, AdminPanel, SiteImage (shared image rules),
                      OgCard (shared link-preview card), artwork
lib/                  types, tiers (featured / collection rules),
                      auth (passcode + signed session cookie),
                      store (file / GitHub adapters), github (Contents API),
                      optimizeImage (upload-time image optimization),
                      screenshots (real repo images: SSIP25, RWIS only),
                      siteUrl (canonical site URL from NEXT_PUBLIC_SITE_URL)
data/                 Seed data: projects.json, profile.json, achievements.json,
                      experience.json
public/               ankit-photo.jpg, uploads/ (certificate uploads),
                      screenshots/ (real result figures from the repos)
```
