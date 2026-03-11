import { parseExpertise, type ExpertiseItem } from "@/lib/parseExpertise";
import { freshFetchText } from "@/lib/freshFetchText";

export const loadExpertise = async (): Promise<ExpertiseItem[]> => {
  const text = await freshFetchText("/data/experties/experties.txt");
  return parseExpertise(text);
};

