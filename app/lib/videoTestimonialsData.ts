import { parseVideoTestimonials, type VideoTestimonialData } from "@/lib/parseVideoTestimonials";

const safeFetchText = async (url: string): Promise<string> => {
  const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}ts=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
};

export const loadVideoTestimonials = async (): Promise<VideoTestimonialData[]> => {
  try {
    const text = await safeFetchText("/data/testnomial/Video.txt");
    return parseVideoTestimonials(text);
  } catch {
    const fallbackText = await safeFetchText("/data/testinomial/Video.txt");
    return parseVideoTestimonials(fallbackText);
  }
};

