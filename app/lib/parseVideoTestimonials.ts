export type VideoTestimonialData = {
  id: string;
  video: string;
  name: string;
  designation: string;
  company: string;
  stars: number;
  quote: string;
  fullTestimonial: string[];
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

const stripWrappedQuotes = (value: string | undefined, fallback: string): string => {
  if (!value) return fallback;
  const trimmed = value.trim();
  return trimmed.replace(/^"(.*)"$/, "$1");
};

const getFullTestimonial = (fields: Record<string, string>): string[] =>
  Object.entries(fields)
    .filter(([key, value]) => key.startsWith("fulltestimonial") && Boolean(value.trim()))
    .sort(([left], [right]) => {
      const leftIndex = Number.parseInt(left.replace("fulltestimonial", ""), 10);
      const rightIndex = Number.parseInt(right.replace("fulltestimonial", ""), 10);
      return leftIndex - rightIndex;
    })
    .map(([, value]) => stripWrappedQuotes(value, "").trim())
    .filter(Boolean);

export const parseVideoTestimonials = (raw: string): VideoTestimonialData[] => {
  const blocks = splitBlocks(raw);
  const parsed: VideoTestimonialData[] = [];

  blocks.forEach((block, index) => {
    const fields = parseFields(block);
    if (Object.keys(fields).length === 0) return;

    parsed.push({
      id: fields.id || `video-testimonial-${index + 1}`,
      video: fields.video || "",
      name: fields.name || "Anonymous Client",
      designation: fields.designation || "Client",
      company: fields.company || fields.designation || "Client",
      stars: toStars(fields.stars),
      quote: stripWrappedQuotes(fields.quote, "No quote provided."),
      fullTestimonial: getFullTestimonial(fields),
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
