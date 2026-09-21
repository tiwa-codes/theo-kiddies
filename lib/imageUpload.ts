/**
 * Product photo upload from the admin.
 *
 * Vercel rejects any request body over about 4.5 MB, and phone photos are
 * routinely 3-8 MB each — so sending several photos in one request (or even
 * one big photo) failed outright, and the host's plain-text "413" reply
 * crashed the page's JSON parsing with a confusing error. Two things fix it:
 *
 *  1. one request per photo, so one photo failing can't lose the others;
 *  2. big photos are shrunk in the browser first (also better for page speed:
 *     nobody needs a 6000px original on a product card).
 */

export const MAX_DIMENSION = 2000;
/** Photos at or under this are uploaded untouched, keeping full quality. */
export const COMPRESS_ABOVE_BYTES = 1_000_000;
/** Under the host's ~4.5 MB body limit, leaving room for multipart overhead. */
export const MAX_UPLOAD_BYTES = 4_000_000;
const JPEG_QUALITY = 0.85;
const UPLOAD_URL = "/api/admin/products/upload-image";

/** Scale down to fit within `max` on the long side, keeping aspect ratio. Never scales up. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const scale = max / longest;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Shrink a large photo to a JPEG no bigger than MAX_DIMENSION. Small files,
 * GIFs (would lose animation), anything the browser can't decode (e.g. HEIC
 * on desktop), and cases where re-encoding wouldn't help are returned as-is.
 * Transparent areas become white — fine for product photos.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (file.size <= COMPRESS_ABOVE_BYTES || file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { width, height } = fitWithin(bitmap.width, bitmap.height, MAX_DIMENSION);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export type UploadFailure = { name: string; reason: string };

export type UploadResult = {
  /** Public URLs of the photos that uploaded, in the order they were chosen. */
  urls: string[];
  failures: UploadFailure[];
};

type UploadOptions = {
  prepare?: (file: File) => Promise<File>;
  fetchFn?: typeof fetch;
  onProgress?: (done: number, total: number) => void;
};

/** Upload photos one request each. Never throws: problems come back as `failures`. */
export async function uploadProductImages(
  files: File[],
  { prepare = prepareImageForUpload, fetchFn, onProgress }: UploadOptions = {}
): Promise<UploadResult> {
  const doFetch = fetchFn ?? fetch;
  const urls: string[] = [];
  const failures: UploadFailure[] = [];

  onProgress?.(0, files.length);

  for (let i = 0; i < files.length; i++) {
    const original = files[i];
    const fail = (reason: string) => failures.push({ name: original.name, reason });

    try {
      if (!original.type.startsWith("image/")) {
        fail("Not an image file");
      } else {
        const file = await prepare(original);
        if (file.size > MAX_UPLOAD_BYTES) {
          fail("Too large to upload even after shrinking — try a smaller photo");
        } else {
          const body = new FormData();
          body.append("files", file);
          const res = await doFetch(UPLOAD_URL, { method: "POST", body });

          // Read as text first: a host-level error (413, 502) isn't JSON.
          const text = await res.text();
          let data: { urls?: unknown; error?: unknown } | null = null;
          try {
            data = JSON.parse(text);
          } catch {
            data = null;
          }

          if (!res.ok) {
            fail(
              res.status === 413
                ? "Photo is too large for the server — try a smaller one"
                : typeof data?.error === "string"
                  ? data.error
                  : `Upload failed (${res.status})`
            );
          } else {
            const uploaded = Array.isArray(data?.urls)
              ? data.urls.filter((u): u is string => typeof u === "string")
              : [];
            if (uploaded.length === 0) fail("The server didn't return an image URL");
            else urls.push(...uploaded);
          }
        }
      }
    } catch (err) {
      fail(err instanceof Error ? err.message : "Upload failed");
    }

    onProgress?.(i + 1, files.length);
  }

  return { urls, failures };
}
