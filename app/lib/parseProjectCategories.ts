const normalizeCategoryLine = (line: string): string =>
  line
    .trim()
    .replace(/^\d+\.\s*/, "");

export const parseProjectCategories = (raw: string): string[] => {
  const seen = new Set<string>();
  const categories: string[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const category = normalizeCategoryLine(trimmed);
    if (!category) continue;

    const key = category.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    categories.push(category);
  }

  return categories;
};

