import { parseExpertise, type ExpertiseItem } from "@/lib/parseExpertise";

const safeFetchText = async (url: string): Promise<string> => {
  const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}ts=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
};

export const loadExpertise = async (): Promise<ExpertiseItem[]> => {
  const text = await safeFetchText("/data/experties/experties.txt");
  return parseExpertise(text);
};

