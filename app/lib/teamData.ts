import { parseTeam, type TeamMember } from "@/lib/parseTeam";
import { freshFetchText } from "@/lib/freshFetchText";

export const loadTeamMembers = async (): Promise<TeamMember[]> => {
  const text = await freshFetchText("/data/team/team.txt");
  return parseTeam(text);
};

