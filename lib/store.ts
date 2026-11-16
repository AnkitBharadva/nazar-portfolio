import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Achievement, Experience, Profile, Project, SiteData } from "./types";
import { getGitHubConfig, githubReadFile, githubWriteFile } from "./github";

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const FILES = {
  projects: "data/projects.json",
  profile: "data/profile.json",
  achievements: "data/achievements.json",
  experience: "data/experience.json",
} as const;

type DataKey = keyof typeof FILES;

function localPath(key: DataKey): string {
  // Literal paths (not a dynamic lookup) so Turbopack traces only data/.
  switch (key) {
    case "projects":
      return path.join(process.cwd(), "data", "projects.json");
    case "profile":
      return path.join(process.cwd(), "data", "profile.json");
    case "achievements":
      return path.join(process.cwd(), "data", "achievements.json");
    case "experience":
      return path.join(process.cwd(), "data", "experience.json");
  }
}

async function readLocalJson<T>(key: DataKey): Promise<T> {
  const raw = await fs.readFile(localPath(key), "utf8");
  return JSON.parse(raw) as T;
}

/**
 * Read one data file. In GitHub mode the repo is the source of truth (admin
 * edits commit there); on any GitHub failure it falls back to the local file
 * so the public site never goes down because of an API error.
 */
async function readJson<T>(key: DataKey): Promise<T> {
  const cfg = getGitHubConfig();
  if (cfg) {
    try {
      const file = await githubReadFile(cfg, FILES[key]);
      if (file) return JSON.parse(file.content.toString("utf8")) as T;
    } catch {
      // Fall through to the local file.
    }
  }
  return readLocalJson<T>(key);
}

async function writeJson<T>(key: DataKey, value: T): Promise<void> {
  // Plain JSON.stringify: the data files are UTF-8 (non-ASCII written
  // literally), so admin writes are byte-stable — a no-op round-trip
  // leaves the file unchanged. Do not add \uXXXX escaping here: it would
  // rewrite every line containing an em-dash or accent on every save.
  const text = JSON.stringify(value, null, 2) + "\n";
  const cfg = getGitHubConfig();
  if (cfg) {
    await githubWriteFile(
      cfg,
      FILES[key],
      Buffer.from(text, "utf8"),
      `portfolio: update ${FILES[key]} via admin`,
    );
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(localPath(key), text, "utf8");
}

export async function getSiteData(): Promise<SiteData> {
  const [profile, projects, achievements, experience] = await Promise.all([
    readJson<Profile>("profile"),
    readJson<Project[]>("projects"),
    readJson<Achievement[]>("achievements"),
    readJson<Experience[]>("experience"),
  ]);
  return { profile, projects, achievements, experience };
}

/**
 * Request-scoped memoized read for server components. The root layout, the
 * case-study metadata and the case-study page all read the same data in
 * one request — this keeps it to a single read (one GitHub API round-trip
 * in GitHub mode, not three). Route handlers keep using the plain
 * getSiteData; cache() is a render-pass memo, not a cross-request cache,
 * so admin edits still show immediately on the next request.
 */
export const getCachedSiteData = cache(getSiteData);

export async function saveProjects(projects: Project[]): Promise<void> {
  await writeJson("projects", projects);
}

export async function saveProfile(profile: Profile): Promise<void> {
  await writeJson("profile", profile);
}

export async function saveAchievements(achievements: Achievement[]): Promise<void> {
  await writeJson("achievements", achievements);
}

export async function saveExperience(experience: Experience[]): Promise<void> {
  await writeJson("experience", experience);
}

const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export function isAllowedUploadType(mime: string): boolean {
  return ALLOWED_UPLOAD_TYPES.has(mime);
}

/** Sanitise an uploaded filename to a safe, URL-friendly name. */
export function safeFileName(original: string): string {
  const base = original
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  const stamp = Date.now().toString(36);
  return `${stamp}-${base || "upload"}`;
}

/**
 * Store an uploaded file and return its URL.
 *
 * Files are served through /api/uploads/[name] (see that route), NOT from
 * public/ directly: files written to public/ after the build are not
 * picked up by `next start`, and on Vercel they would never be part of
 * the deployment. The API route reads from disk in file mode and from the
 * repo in GitHub mode, so uploads are viewable immediately in both modes.
 */
export async function saveUpload(
  fileName: string,
  bytes: Buffer,
): Promise<string> {
  const cfg = getGitHubConfig();
  if (cfg) {
    await githubWriteFile(
      cfg,
      `public/uploads/${fileName}`,
      bytes,
      `portfolio: upload ${fileName} via admin`,
    );
    return `/api/uploads/${fileName}`;
  }
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, fileName), bytes);
  return `/api/uploads/${fileName}`;
}
