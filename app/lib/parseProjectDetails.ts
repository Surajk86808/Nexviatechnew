export type ProjectDetailsData = {
  id: string;
  overview: string;
  problem: string;
  solution: string;
  impact: string[];
  features: string[];
  tech: {
    frontend: string[];
    backend: string[];
    database: string[];
    infrastructure: string[];
  };
  deployment: string;
};

const splitBlocks = (raw: string): string[] =>
  raw
    .split(/\r?\n\s*\r?\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

const splitCsv = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const createEmptyDetails = (id: string, index: number): ProjectDetailsData => ({
  id: id || `project-${index + 1}`,
  overview: "",
  problem: "",
  solution: "",
  impact: [],
  features: [],
  tech: {
    frontend: [],
    backend: [],
    database: [],
    infrastructure: [],
  },
  deployment: "",
});

export const parseProjectDetails = (raw: string): ProjectDetailsData[] => {
  const blocks = splitBlocks(raw);

  return blocks.map((block, index) => {
    const details = createEmptyDetails("", index);
    let currentListSection: "impact" | "features" | null = null;
    let inTechSection = false;

    for (const line of block.split(/\r?\n/)) {
      const rawLine = line.replace(/\r/g, "");
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const topLevelMatch = trimmed.match(/^([a-zA-Z]+)\s*:\s*(.*)$/);
      if (topLevelMatch) {
        const key = topLevelMatch[1].toLowerCase();
        const value = topLevelMatch[2].trim();

        if (key === "id") {
          details.id = value || details.id;
          currentListSection = null;
          inTechSection = false;
          continue;
        }
        if (key === "overview") {
          details.overview = value;
          currentListSection = null;
          inTechSection = false;
          continue;
        }
        if (key === "problem") {
          details.problem = value;
          currentListSection = null;
          inTechSection = false;
          continue;
        }
        if (key === "solution") {
          details.solution = value;
          currentListSection = null;
          inTechSection = false;
          continue;
        }
        if (key === "deployment") {
          details.deployment = value;
          currentListSection = null;
          inTechSection = false;
          continue;
        }
        if (key === "impact" || key === "features") {
          currentListSection = key;
          inTechSection = false;
          if (value) details[key].push(value);
          continue;
        }
        if (key === "tech") {
          currentListSection = null;
          inTechSection = true;
          continue;
        }
      }

      if (inTechSection) {
        const techMatch = trimmed.match(/^(frontend|backend|database|infrastructure)\s*:\s*(.*)$/i);
        if (techMatch) {
          const techKey = techMatch[1].toLowerCase() as keyof ProjectDetailsData["tech"];
          details.tech[techKey] = splitCsv(techMatch[2].trim());
          continue;
        }
      }

      if (currentListSection && trimmed.startsWith("-")) {
        const bulletValue = trimmed.replace(/^-+\s*/, "").trim();
        if (bulletValue) details[currentListSection].push(bulletValue);
      }
    }

    details.overview ||= "No overview provided.";
    details.problem ||= "No problem statement provided.";
    details.solution ||= "No solution details provided.";
    details.deployment ||= "No deployment details provided.";

    return details;
  });
};
