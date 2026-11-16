import sharp from "sharp";

/**
 * Upload-time image optimization (server-only).
 *
 * Admin uploads (certificate images) used to be stored raw — a phone photo
 * or a 3000px scan would sit in the repo at full size forever, and every
 * future image would make the site heavier. This pass runs before the file
 * is stored, in BOTH storage modes (file + GitHub), so the stored file is
 * always the optimized one:
 *
 * - JPEG / PNG / WebP: cap the longest side at 1600px, re-encode in the
 *   SAME format at quality 80. If the result is still over ~1 MB, a
 *   second pass caps at 1200px and quality 70.
 * - GIF (animation) and PDF: untouched — re-encoding would destroy them.
 * - EXIF orientation is honoured, so phone photos never arrive sideways.
 * - The result is never larger than the original, unless the original
 *   exceeded the 1600px cap (then the dimension cap wins).
 *
 * Optimization must never break an upload: on any failure the original
 * bytes are returned untouched.
 */

const MAX_BYTES_AFTER_FIRST_PASS = 1 * 1024 * 1024; // ~1 MB
const FIRST_PASS_MAX_SIDE = 1600;
const SECOND_PASS_MAX_SIDE = 1200;

type OptimizableFormat = "jpeg" | "png" | "webp";

async function encode(
  bytes: Buffer,
  format: OptimizableFormat,
  maxSide: number,
  quality: number,
): Promise<Buffer> {
  const pipeline = sharp(bytes)
    .rotate()
    .resize({
      width: maxSide,
      height: maxSide,
      fit: "inside",
      withoutEnlargement: true,
    });
  switch (format) {
    case "jpeg":
      return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    case "png":
      return pipeline.png({ quality }).toBuffer();
    case "webp":
      return pipeline.webp({ quality }).toBuffer();
  }
}

export async function optimizeUploadImage(
  bytes: Buffer,
  mime: string,
): Promise<Buffer> {
  if (mime !== "image/jpeg" && mime !== "image/png" && mime !== "image/webp") {
    return bytes;
  }
  try {
    const meta = await sharp(bytes).metadata();
    const format = meta.format;
    if (format !== "jpeg" && format !== "png" && format !== "webp") {
      // Content does not match the claimed type — store as-is.
      return bytes;
    }
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
    let out = await encode(bytes, format, FIRST_PASS_MAX_SIDE, 80);
    if (out.length > MAX_BYTES_AFTER_FIRST_PASS) {
      out = await encode(bytes, format, SECOND_PASS_MAX_SIDE, 70);
    }
    if (out.length <= bytes.length || longest > FIRST_PASS_MAX_SIDE) {
      return out;
    }
    return bytes;
  } catch {
    return bytes;
  }
}
