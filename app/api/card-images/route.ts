import { NextResponse } from "next/server";
import path from "path";
import { readdir } from "fs/promises";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"]);

const normalizeKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isImageFile = (filename: string): boolean => {
  const extension = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.has(extension);
};

export async function GET() {
  try {
    const cardsRoot = path.join(process.cwd(), "public", "cards");
    const entries = await readdir(cardsRoot, { withFileTypes: true });
    const manifest: Record<string, string[]> = {};

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const folderName = entry.name;
      const folderPath = path.join(cardsRoot, folderName);
      const files = await readdir(folderPath, { withFileTypes: true });

      const images = files
        .filter((fileEntry) => fileEntry.isFile() && isImageFile(fileEntry.name))
        .map((fileEntry) => `/cards/${folderName}/${encodeURIComponent(fileEntry.name)}`);

      if (images.length) {
        manifest[normalizeKey(folderName)] = images;
      }
    }

    return NextResponse.json(
      { success: true, manifest },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: true, manifest: {} },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}

