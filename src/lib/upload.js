import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB keeps pages light on slow connections

// Where uploads are stored. In production, mount a persistent volume here
// (or replace this module with an S3/Cloudinary uploader).
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

/** Identify the image type from the file's own bytes. We never trust the filename or
 *  the browser-reported MIME type, because both are trivially faked. SVG is refused
 *  on purpose, since SVG files can carry scripts. */
function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (
    buf.length > 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  ) return "png";
  if (
    buf.length > 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) return "webp";
  return null;
}

/**
 * Saves an uploaded File (from FormData). Returns { url } or { error }.
 * `file` may be null/empty, in which case { url: null } is returned.
 */
export async function saveImage(file) {
  if (!file || typeof file === "string" || file.size === 0) return { url: null };

  if (file.size > MAX_BYTES) return { error: "Image is too large. Use a file under 3 MB." };

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf);
  if (!ext) return { error: "Upload a JPG, PNG or WebP image." };

  const name = `${crypto.randomBytes(12).toString("hex")}.${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf, { flag: "wx" });
  return { url: `/uploads/${name}` };
}

/** Best-effort removal of a previously uploaded file. Only touches our own folder. */
export async function removeImage(url) {
  if (!url || !url.startsWith("/uploads/")) return;
  const name = path.basename(url);
  try {
    await fs.unlink(path.join(UPLOAD_DIR, name));
  } catch {
    /* already gone */
  }
}
