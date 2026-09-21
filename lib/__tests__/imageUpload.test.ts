import { describe, expect, it, vi } from "vitest";
import {
  MAX_UPLOAD_BYTES,
  fitWithin,
  uploadProductImages,
} from "@/lib/imageUpload";

function image(name: string, bytes = 1000, type = "image/jpeg") {
  return new File([new Uint8Array(bytes)], name, { type });
}

/** A fake upload endpoint that records what it was sent and answers per file name. */
function fakeFetch(reply: (fileName: string) => { status: number; body: string }) {
  const calls: string[][] = [];
  const fn = vi.fn(async (_url: string, init: { body: FormData }) => {
    const sent = init.body.getAll("files") as File[];
    calls.push(sent.map((f) => f.name));
    const { status, body } = reply(sent[0].name);
    return new Response(body, { status });
  });
  return { fn: fn as unknown as typeof fetch, calls };
}

const ok = (name: string) => ({ status: 201, body: JSON.stringify({ urls: [`https://cdn/${name}`] }) });
const identity = async (f: File) => f;

describe("fitWithin", () => {
  it("scales the long side down to the limit, keeping the aspect ratio", () => {
    expect(fitWithin(6000, 4000, 2000)).toEqual({ width: 2000, height: 1333 });
    expect(fitWithin(3000, 6000, 2000)).toEqual({ width: 1000, height: 2000 });
  });

  it("never scales up", () => {
    expect(fitWithin(800, 600, 2000)).toEqual({ width: 800, height: 600 });
  });
});

describe("uploadProductImages", () => {
  it("sends one request per image, so no single request can exceed the host's body limit", async () => {
    const { fn, calls } = fakeFetch((n) => ok(n));
    const result = await uploadProductImages([image("a.jpg"), image("b.jpg"), image("c.jpg")], {
      prepare: identity,
      fetchFn: fn,
    });
    expect(calls).toEqual([["a.jpg"], ["b.jpg"], ["c.jpg"]]);
    expect(result.failures).toEqual([]);
  });

  it("returns urls in the order the files were chosen (the first is the cover image)", async () => {
    const { fn } = fakeFetch((n) => ok(n));
    const result = await uploadProductImages([image("a.jpg"), image("b.jpg"), image("c.jpg")], {
      prepare: identity,
      fetchFn: fn,
    });
    expect(result.urls).toEqual(["https://cdn/a.jpg", "https://cdn/b.jpg", "https://cdn/c.jpg"]);
  });

  it("keeps the images that worked when one fails, and says which failed and why", async () => {
    const { fn } = fakeFetch((n) =>
      n === "b.jpg" ? { status: 500, body: JSON.stringify({ error: "Bucket missing" }) } : ok(n)
    );
    const result = await uploadProductImages([image("a.jpg"), image("b.jpg"), image("c.jpg")], {
      prepare: identity,
      fetchFn: fn,
    });
    expect(result.urls).toEqual(["https://cdn/a.jpg", "https://cdn/c.jpg"]);
    expect(result.failures).toEqual([{ name: "b.jpg", reason: "Bucket missing" }]);
  });

  it("turns the host's plain-text 413 into a readable message instead of a JSON parse error", async () => {
    const { fn } = fakeFetch(() => ({ status: 413, body: "Request Entity Too Large" }));
    const result = await uploadProductImages([image("big.jpg")], { prepare: identity, fetchFn: fn });
    expect(result.urls).toEqual([]);
    expect(result.failures[0].reason).toMatch(/too large/i);
  });

  it("copes with any non-JSON error body", async () => {
    const { fn } = fakeFetch(() => ({ status: 502, body: "<html>Bad gateway</html>" }));
    const result = await uploadProductImages([image("a.jpg")], { prepare: identity, fetchFn: fn });
    expect(result.failures[0].reason).toMatch(/502/);
  });

  it("rejects files that aren't images without sending them", async () => {
    const { fn, calls } = fakeFetch((n) => ok(n));
    const result = await uploadProductImages([image("notes.pdf", 100, "application/pdf")], {
      prepare: identity,
      fetchFn: fn,
    });
    expect(calls).toEqual([]);
    expect(result.failures).toEqual([{ name: "notes.pdf", reason: "Not an image file" }]);
  });

  it("refuses, without sending, an image that is still too big after preparing it", async () => {
    const { fn, calls } = fakeFetch((n) => ok(n));
    const huge = image("huge.jpg", MAX_UPLOAD_BYTES + 1);
    const result = await uploadProductImages([huge], { prepare: identity, fetchFn: fn });
    expect(calls).toEqual([]);
    expect(result.failures[0].reason).toMatch(/too large/i);
  });

  it("uploads the prepared (smaller) file, not the original", async () => {
    const { fn, calls } = fakeFetch((n) => ok(n));
    const shrink = async (f: File) => new File([new Uint8Array(10)], f.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
    await uploadProductImages([image("photo.png", 5_000_000, "image/png")], { prepare: shrink, fetchFn: fn });
    expect(calls).toEqual([["photo.jpg"]]);
  });

  it("reports progress after each file", async () => {
    const { fn } = fakeFetch((n) => ok(n));
    const progress: Array<[number, number]> = [];
    await uploadProductImages([image("a.jpg"), image("b.jpg")], {
      prepare: identity,
      fetchFn: fn,
      onProgress: (done, total) => progress.push([done, total]),
    });
    expect(progress).toEqual([[0, 2], [1, 2], [2, 2]]);
  });
});
