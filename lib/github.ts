/**
 * Minimal GitHub Contents API client.
 *
 * Used only when GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO are set.
 * Admin writes commit the JSON data files (and uploaded images) back to the
 * repo, so edits persist and auto-redeploy on Vercel.
 */

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export function getGitHubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) return null;
  return { token, owner, repo, branch: process.env.GITHUB_BRANCH || "main" };
}

export function isGitHubMode(): boolean {
  return getGitHubConfig() !== null;
}

function apiUrl(cfg: GitHubConfig, path: string): string {
  return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;
}

async function githubFetch(
  cfg: GitHubConfig,
  path: string,
  init: RequestInit,
): Promise<Response> {
  return fetch(apiUrl(cfg, path), {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${cfg.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers || {}),
    },
  });
}

interface ContentsEntry {
  sha: string;
  content?: string;
  encoding?: string;
}

/** Read a file from the repo. Returns null when the file does not exist. */
export async function githubReadFile(
  cfg: GitHubConfig,
  path: string,
): Promise<{ sha: string; content: Buffer } | null> {
  const res = await githubFetch(cfg, `${path}?ref=${encodeURIComponent(cfg.branch)}`, {
    method: "GET",
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub read failed for ${path}: ${res.status} ${res.statusText}`);
  }
  const entry = (await res.json()) as ContentsEntry;
  if (Array.isArray(entry)) throw new Error(`GitHub path ${path} is a directory`);
  const content = Buffer.from((entry.content || "").replace(/\n/g, ""), "base64");
  return { sha: entry.sha, content };
}

/**
 * Create or update a file in the repo (read SHA first, then PUT).
 * `content` is the raw file bytes; `message` is the commit message.
 */
export async function githubWriteFile(
  cfg: GitHubConfig,
  path: string,
  content: Buffer,
  message: string,
): Promise<void> {
  const existing = await githubReadFile(cfg, path).catch(() => null);
  const body: Record<string, string> = {
    message,
    content: content.toString("base64"),
    branch: cfg.branch,
  };
  if (existing) body.sha = existing.sha;
  const res = await githubFetch(cfg, path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`GitHub write failed for ${path}: ${res.status} ${res.statusText}`);
  }
}
