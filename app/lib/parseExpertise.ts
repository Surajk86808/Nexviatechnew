export type ExpertiseItem = {
  id: string;
  icon: string;
  title: string;
  description: string;
  span?: string;
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

    const separator = trimmed.indexOf(":");
    if (separator < 0) continue;

    const key = trimmed.slice(0, separator).trim().toLowerCase();
    const value = trimmed.slice(separator + 1).trim();
    fields[key] = value;
  }
  return fields;
};

export const parseExpertise = (raw: string): ExpertiseItem[] => {
  const blocks = splitBlocks(raw);

  const parsed: ExpertiseItem[] = [];

  blocks.forEach((block, index) => {
    const fields = parseFields(block);
    if (Object.keys(fields).length === 0) return;

    parsed.push({
      id: fields.id || `expertise-${index + 1}`,
      icon: fields.icon || "brain",
      title: fields.title || `Expertise ${index + 1}`,
      description: fields.description || "No description provided.",
      span: fields.span || undefined,
    });
  });

  return parsed;
};
