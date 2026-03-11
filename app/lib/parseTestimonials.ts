export type TestimonialData = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  image?: string;
  reviewUrl?: string;
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

export const parseTestimonials = (raw: string): TestimonialData[] => {
  const blocks = splitBlocks(raw);

  const parsed: TestimonialData[] = [];

  blocks.forEach((block, index) => {
    const fields = parseFields(block);
    if (Object.keys(fields).length === 0) return;
    parsed.push({
      id: fields.id || `testimonial-${index + 1}`,
      quote: fields.quote || "No testimonial provided.",
      name: fields.name || "Anonymous Client",
      role: fields.role || "Client",
      company: fields.company || "N/A",
      image: fields.image || undefined,
      reviewUrl: fields.review_url || undefined,
    });
  });

  const seen = new Set<string>();
  return parsed.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};
