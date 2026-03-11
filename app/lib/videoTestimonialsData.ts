import { parseVideoTestimonials, type VideoTestimonialData } from "@/lib/parseVideoTestimonials";
import { freshFetchText } from "@/lib/freshFetchText";

export const loadVideoTestimonials = async (): Promise<VideoTestimonialData[]> => {
  try {
    const text = await freshFetchText("/data/testnomial/Video.txt");
    return parseVideoTestimonials(text);
  } catch {
    const fallbackText = await freshFetchText("/data/testinomial/Video.txt");
    return parseVideoTestimonials(fallbackText);
  }
};
