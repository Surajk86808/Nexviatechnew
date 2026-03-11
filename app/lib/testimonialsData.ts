import { parseTestimonials, type TestimonialData } from "@/lib/parseTestimonials";
import { freshFetchText } from "@/lib/freshFetchText";

export const loadTestimonials = async (): Promise<TestimonialData[]> => {
  const text = await freshFetchText("/data/testnomial/testimonials.txt");
  return parseTestimonials(text);
};

