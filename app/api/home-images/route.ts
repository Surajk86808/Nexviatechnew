import { NextResponse } from "next/server";
import path from "path";
import { readdir, stat } from "fs/promises";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"]);

const isImageFile = (filename: string): boolean => IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());

const getSortOrder = (filename: string): number => {
  const match = filename.match(/image(\d+)/i);
  return match ? Number.parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
};

export async function GET() {
  try {
    const imagesRoot = path.join(process.cwd(), "public", "data", "home", "images");
    const entries = await readdir(imagesRoot, { withFileTypes: true });

    const imageEntries = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && isImageFile(entry.name))
        .map(async (entry) => {
          const filePath = path.join(imagesRoot, entry.name);
          const fileStat = await stat(filePath);
          return {
            name: entry.name,
            mtimeMs: fileStat.mtimeMs,
          };
        })
    );

    const images = imageEntries
      .sort((a, b) => {
        const orderDifference = getSortOrder(a.name) - getSortOrder(b.name);
        return orderDifference !== 0 ? orderDifference : a.name.localeCompare(b.name);
      })
      .map((entry) => `/data/home/images/${encodeURIComponent(entry.name)}?v=${Math.floor(entry.mtimeMs)}`);

    return NextResponse.json(
      { success: true, images },
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
      { success: true, images: [] },
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
