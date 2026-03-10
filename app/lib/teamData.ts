import { parseTeam, type TeamMember } from "@/lib/parseTeam";

const safeFetchText = async (url: string): Promise<string> => {
  const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}ts=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
};

export const loadTeamMembers = async (): Promise<TeamMember[]> => {
  const text = await safeFetchText("/data/team/team.txt");
  return parseTeam(text);
};

