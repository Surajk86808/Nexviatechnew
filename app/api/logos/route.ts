import { NextResponse } from "next/server";
import path from "path";
import { readdir } from "fs/promises";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"]);

const toDisplayName = (filename: string): string =>
  filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const isImageFile = (filename: string): boolean => IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());

export async function GET() {
  try {
    const logoRoot = path.join(process.cwd(), "public", "logo");
    const entries = await readdir(logoRoot, { withFileTypes: true });

    const logos = entries
      .filter((entry) => entry.isFile() && isImageFile(entry.name))
      .map((entry) => ({
        name: toDisplayName(entry.name),
        src: `/logo/${encodeURIComponent(entry.name)}`,
      }));

    return NextResponse.json({ success: true, logos });
  } catch {
    return NextResponse.json({ success: true, logos: [] });
  }
}

