export type TeamContactType = "linkedin" | "phone" | "portfolio" | "instagram" | "email";

export type TeamContact = {
  type: TeamContactType;
  value: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  hasImage: boolean;
  imagePath: string;
  contacts: TeamContact[];
};

const slugifyName = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CONTACT_FIELDS: TeamContactType[] = ["linkedin", "phone", "portfolio", "instagram", "email"];

const toBoolean = (value?: string): boolean => {
  if (!value) return false;
  return ["true", "1", "yes", "y"].includes(value.trim().toLowerCase());
};

const resolveImagePath = (id: string, name: string): string => {
  const normalized = id || slugifyName(name);
  // Primary convention: /public/team/images/{id}.png
  return `/team/images/${normalized}.png`;
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

export const parseTeam = (raw: string): TeamMember[] => {
  const blocks = splitBlocks(raw);
  const parsed: TeamMember[] = [];

  blocks.forEach((block, index) => {
    const fields = parseFields(block);
    if (Object.keys(fields).length === 0) return;
    const id = fields.id || `member-${index + 1}`;
    const name = fields.name || `Team Member ${index + 1}`;

    const contacts = CONTACT_FIELDS.flatMap((type) => {
      const value = fields[type];
      if (!value) return [];
      return [{ type, value }] as TeamContact[];
    });

    parsed.push({
      id,
      name,
      role: fields.role || "Team Member",
      bio: fields.bio || "No bio provided.",
      hasImage: toBoolean(fields.hasimage),
      imagePath: resolveImagePath(id, name),
      contacts,
    });
  });

  const seen = new Set<string>();
  return parsed.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};
