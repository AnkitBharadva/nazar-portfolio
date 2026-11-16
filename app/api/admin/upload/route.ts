import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  MAX_UPLOAD_BYTES,
  isAllowedUploadType,
  safeFileName,
  saveUpload,
} from "@/lib/store";
import { optimizeUploadImage } from "@/lib/optimizeImage";
import { badRequest, requireAdmin } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * Upload a certificate file (JPG/PNG/WebP/GIF/PDF, max 10 MB).
 * Expects multipart form data with a `file` field.
 * Image uploads are optimized before storing (see lib/optimizeImage) so
 * the stored file is always the small one, in both storage modes.
 * Returns the public URL path; the caller attaches it to an achievement.
 */
export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return badRequest("Expected multipart form data with a file.");
  }
  const file = form.get("file");
  if (!(file instanceof File)) return badRequest("No file was uploaded.");
  if (!isAllowedUploadType(file.type)) {
    return badRequest("Only JPG, PNG, WebP, GIF or PDF files are accepted.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return badRequest("File is too large (10 MB maximum).");
  }

  const name = safeFileName(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());
  // Optimize before storing — the optimized bytes are what get written to
  // disk in file mode and committed to the repo in GitHub mode.
  const stored = await optimizeUploadImage(bytes, file.type);
  const url = await saveUpload(name, stored);
  return NextResponse.json({ ok: true, url, name: file.name }, { status: 201 });
}
