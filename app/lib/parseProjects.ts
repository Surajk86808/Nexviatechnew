export type ProjectCardData = {
  id: string;
  category: string;
  type: string;
  title: string;
  shortDescription: string;
  description: string;
  tech: string[];
  thumbnailImage?: string;
  previewImages: string[];
  liveUrl?: string;
  repoUrl?: string;
};

const splitBlocks = (raw: string): string[] =>
  raw
    .split(/\r?\n\s*\r?\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

const parseKeyValueLines = (block: string): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex < 0) continue;

    const key = trimmed.slice(0, separatorIndex).trim().toLowerCase();
    const value = trimmed.slice(separatorIndex + 1).trim();
    map[key] = value;
  }
  return map;
};

const parseTechList = (value?: string): string[] =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseImageList = (value?: string): string[] =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const fallbackId = (index: number): string => `project-${index + 1}`;

export const parseProjects = (raw: string): ProjectCardData[] => {
  const blocks = splitBlocks(raw);

  const parsed: ProjectCardData[] = [];

  blocks.forEach((block, index) => {
    const fields = parseKeyValueLines(block);
    if (Object.keys(fields).length === 0) return;

    const id = fields.id || fallbackId(index);
    const title = fields.title || `Untitled Project ${index + 1}`;
    const category = fields.category || fields.type || "Uncategorized";
    const shortDescription = fields.shortdescription || fields.description || "No description provided.";
    const tech = parseTechList(fields.techstack || fields.tech);

    parsed.push({
      id,
      category,
      type: fields.type || category || "PROJECT",
      title,
      shortDescription,
      description: shortDescription,
      tech,
      thumbnailImage: fields.thumbnailimage || undefined,
      previewImages: parseImageList(fields.previewimages),
      liveUrl: fields.liveurl || undefined,
      repoUrl: fields.repourl || undefined,
    });
  });

  // Keep first occurrence of each id to avoid duplicate cards when source text
  // contains repeated blocks.
  const seen = new Set<string>();
  return parsed.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};
