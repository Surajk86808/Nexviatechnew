import { parseProjectDetails, type ProjectDetailsData } from "@/lib/parseProjectDetails";
import { parseProjectCategories } from "@/lib/parseProjectCategories";
import { parseProjects, type ProjectCardData } from "@/lib/parseProjects";
import { freshFetchText } from "@/lib/freshFetchText";

export type PortfolioProject = ProjectCardData & {
  details: ProjectDetailsData;
};

const fallbackDetails = (id: string): ProjectDetailsData => ({
  id,
  overview: "No overview provided.",
  problem: "No problem statement provided.",
  solution: "No solution details provided.",
  impact: [],
  features: [],
  tech: {
    frontend: [],
    backend: [],
    database: [],
    infrastructure: [],
  },
  deployment: "No deployment details provided.",
});

const createDetailsLookup = (details: ProjectDetailsData[]): Map<string, ProjectDetailsData> =>
  new Map(details.map((item) => [item.id, item]));

export const loadPortfolioProjects = async (): Promise<PortfolioProject[]> => {
  const [projectsText, detailsText] = await Promise.all([
    freshFetchText("/data/cards/projects.txt"),
    freshFetchText("/data/cards/projectdetails.txt"),
  ]);

  const cards = parseProjects(projectsText);
  const detailsLookup = createDetailsLookup(parseProjectDetails(detailsText));

  return cards.map((card) => ({
    ...card,
    details: detailsLookup.get(card.id) || fallbackDetails(card.id),
  }));
};

export const loadProjectCategories = async (): Promise<string[]> => {
  try {
    const categoriesText = await freshFetchText("/data/projects/category.txt");
    return parseProjectCategories(categoriesText);
  } catch {
    return [];
  }
};

