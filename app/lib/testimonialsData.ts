import { parseTestimonials, type TestimonialData } from "@/lib/parseTestimonials";

const safeFetchText = async (url: string): Promise<string> => {
  const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}ts=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
};

export const loadTestimonials = async (): Promise<TestimonialData[]> => {
  const text = await safeFetchText("/data/testnomial/testimonials.txt");
  return parseTestimonials(text);
};

