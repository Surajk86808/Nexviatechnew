export type VideoTestimonialData = {
  id: string;
  video: string;
  poster: string;
  name: string;
  designation: string;
  stars: number;
  quote: string;
};

const splitBlocks = (raw: string): string[] =>
  raw
    .split(/\r?\n\s*\r?\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

const parseFields = (block: string): Record<string, string> => {
  const fields: Record<string, string> = {};
  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sep = trimmed.indexOf(":");
    if (sep < 0) continue;
    const key = trimmed.slice(0, sep).trim().toLowerCase();
    const value = trimmed.slice(sep + 1).trim();
    fields[key] = value;
  }
  return fields;
};

const toStars = (raw: string | undefined): number => {
  const parsed = Number.parseInt(raw || "", 10);
  if (!Number.isFinite(parsed)) return 5;
  return Math.max(1, Math.min(5, parsed));
};

export const parseVideoTestimonials = (raw: string): VideoTestimonialData[] => {
  const blocks = splitBlocks(raw);
  const parsed: VideoTestimonialData[] = [];

  blocks.forEach((block, index) => {
    const fields = parseFields(block);
    if (Object.keys(fields).length === 0) return;

    parsed.push({
      id: fields.id || `video-testimonial-${index + 1}`,
      video: fields.video || "",
      poster: fields.poster || "/placeholder.svg",
      name: fields.name || "Anonymous Client",
      designation: fields.designation || "Client",
      stars: toStars(fields.stars),
      quote: fields.quote || '"No quote provided."',
    });
  });

  const seen = new Set<string>();
  return parsed.filter((item) => {
    if (!item.video) return false;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

