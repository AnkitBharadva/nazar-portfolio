import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getGitHubConfig, githubReadFile } from "@/lib/github";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

/**
 * Serve an uploaded file (e.g. an achievement certificate).
 *
 * Uploads are NOT served from public/ directly: files written to public/
 * after the build are not picked up by `next start`, and on Vercel they
 * would never be part of the deployment. This route reads the file from
 * disk in file mode, or from the repo in GitHub mode, so an uploaded
 * certificate is viewable immediately after upload in both modes.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  // Reject anything that is not a plain file name (no traversal, no nesting).
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name) || name.includes("..")) {
    return new NextResponse("Not found.", { status: 404 });
  }
  const ext = path.extname(name).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) return new NextResponse("Not found.", { status: 404 });

  let bytes: Buffer | null = null;
  const cfg = getGitHubConfig();
  if (cfg) {
    try {
      const file = await githubReadFile(cfg, `public/uploads/${name}`);
      bytes = file ? file.content : null;
    } catch {
      bytes = null;
    }
  }
  if (!bytes) {
    try {
      bytes = await fs.readFile(path.join(process.cwd(), "public", "uploads", name));
    } catch {
      return new NextResponse("Not found.", { status: 404 });
    }
  }

  // Uploaded file names carry a timestamp prefix, so they are immutable.
  return new NextResponse(bytes as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(bytes.length),
    },
  });
}
