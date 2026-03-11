import { useEffect, useMemo, useRef, useState } from "react";
import { Quote, Star } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { loadTestimonials } from "@/lib/testimonialsData";
import type { TestimonialData } from "@/lib/parseTestimonials";
import { useAutoHorizontalLoop } from "@/hooks/useAutoHorizontalLoop";

const trustStats = [
  { label: "Clients Served", value: "15+", subtitle: "Happy clients across multiple industries", number: 15, suffix: "+" },
  { label: "Projects Completed", value: "20+", subtitle: "Successful projects delivered on time", number: 20, suffix: "+" },
  { label: "Uptime Delivered", value: "99.9%", subtitle: "Maintained across all client platforms", number: 99.9, suffix: "%" },
  { label: "Faster Delivery", value: "3x", subtitle: "Compared to traditional agencies", number: 3, suffix: "x" },
];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
    <path
      fill="#4285F4"
      d="M21.81 12.23c0-.71-.06-1.4-.19-2.05H12.2v3.88h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.73 2.99-4.28 2.99-7.35Z"
    />
    <path
      fill="#34A853"
      d="M12.2 22c2.7 0 4.96-.9 6.62-2.42l-3.23-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.8-1.75-5.58-4.1H3.28v2.58A9.99 9.99 0 0 0 12.2 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.62 13.94a6 6 0 0 1 0-3.88V7.48H3.28a9.99 9.99 0 0 0 0 9.04l3.34-2.58Z"
    />
    <path
      fill="#EA4335"
      d="M12.2 5.96c1.47 0 2.8.5 3.84 1.49l2.88-2.88C17.15 2.9 14.9 2 12.2 2a9.99 9.99 0 0 0-8.92 5.48l3.34 2.58c.78-2.35 2.98-4.1 5.58-4.1Z"
    />
  </svg>
);

const GoogleReviewCard = ({ item }: { item: TestimonialData }) => {
  const initials = item.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="interactive-card glow-card premium-card h-full rounded-[16px] border border-slate-200/80 bg-white/70 p-6 sm:p-8 flex flex-col backdrop-blur-sm dark:border-white/10 dark:bg-[#091427]">
      <div className="mb-5 flex items-center justify-between">
        <Quote className="h-6 w-6 shrink-0 text-primary/50" />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#fbbc05]" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} className="h-3.5 w-3.5 fill-[#fbbc05] text-[#fbbc05]" />
            ))}
          </div>
          <span className="inline-flex items-center justify-center rounded-full border border-[#1a73e8]/25 bg-white px-2.5 py-1 shadow-[0_6px_14px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#111c31]">
            <GoogleIcon />
          </span>
        </div>
      </div>

      <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">"{item.quote}"</p>

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-900 ring-1 ring-slate-200 dark:bg-white/5 dark:text-white dark:ring-white/10">
          {initials}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {item.role}, {item.company}
          </p>
        </div>
        {item.reviewUrl ? (
          <a
            href={item.reviewUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full border border-[#1a73e8]/35 bg-[#1a73e8]/8 px-3 py-1.5 text-[11px] font-medium text-[#1a73e8] transition-colors hover:bg-[#1a73e8]/15 hover:text-[#0f172a] dark:text-[#8ab4f8] dark:hover:text-white"
          >
            View on Google
          </a>
        ) : null}
      </div>
    </article>
  );
};

const Testimonials = () => {
  const REFRESH_MS = 4000;
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [animatedNumbers, setAnimatedNumbers] = useState<number[]>(() => trustStats.map(() => 0));
  const statsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }
        const data = await loadTestimonials();
        if (!mounted) return;
        setTestimonials(data);
      } catch {
        if (!mounted) return;
        setTestimonials([]);
        setError("Unable to load Google reviews right now.");
      } finally {
        if (mounted && !silent) setLoading(false);
      }
    };

    run();
    const intervalId = window.setInterval(() => run(true), REFRESH_MS);
    const onFocus = () => run(true);
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const duration = 1100;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedNumbers(trustStats.map((item) => item.number * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [statsVisible]);

  const shouldAnimate = testimonials.length > 3;
  const loopItems = useMemo(() => (shouldAnimate ? [...testimonials, ...testimonials] : testimonials), [shouldAnimate, testimonials]);
  const { viewportRef, trackRef, transform, setPaused, recalculate } = useAutoHorizontalLoop({
    enabled: shouldAnimate,
    speedPxPerSecond: 20,
    direction: "right",
  });

  useEffect(() => {
    recalculate();
  }, [loopItems.length, recalculate]);

  return (
    <section id="result" className="nexviatech-result relative py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div>
          <ScrollReveal>
            <p className="section-label mb-4">Result</p>
            <h2 className="mb-8 text-3xl font-bold tracking-tighter-custom text-gradient sm:text-4xl md:mb-10 md:text-5xl">
              Results Our Clients Actually See
            </h2>
          </ScrollReveal>
        </div>

        <div className="mb-12 rounded-[1.75rem] border border-sky-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(238,246,255,0.84))] p-2 shadow-[0_24px_55px_rgba(59,130,246,0.08)] dark:border-blue-400/15 dark:bg-[linear-gradient(180deg,rgba(12,21,40,0.96),rgba(8,14,28,0.98))] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          <div ref={statsRef} className="grid grid-cols-1 gap-0 rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.7),rgba(219,234,254,0.45))] dark:bg-[linear-gradient(135deg,rgba(28,63,125,0.28),rgba(10,18,35,0.22)_45%,rgba(10,18,35,0.6))] sm:grid-cols-2 lg:grid-cols-4">
            {trustStats.map((item, index) => (
              <ScrollReveal key={item.label} delay={index * 0.06}>
                <div className={`p-5 text-left ${index % 4 !== 3 ? "lg:border-r lg:border-sky-200/55 dark:lg:border-white/10" : ""} ${index < trustStats.length - 1 ? "border-b border-sky-200/55 dark:border-white/10 sm:border-b-0" : ""} ${index % 2 === 0 ? "sm:border-r sm:border-sky-200/55 sm:dark:border-white/10 lg:border-r-0" : ""} ${index % 4 !== 3 ? "lg:border-r lg:border-sky-200/55 lg:dark:border-white/10" : ""}`}>
                  <p className="text-4xl font-bold text-slate-950 drop-shadow-[0_10px_24px_rgba(59,130,246,0.14)] dark:text-foreground dark:drop-shadow-[0_0_16px_rgba(59,130,246,0.4)] sm:text-5xl md:text-6xl">
                    {item.number % 1 === 0 ? Math.round(animatedNumbers[index]) : animatedNumbers[index].toFixed(1)}
                    {item.suffix}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground/80">{item.subtitle}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading reviews...</div>
        ) : error ? (
          <div className="text-sm text-muted-foreground">{error}</div>
        ) : testimonials.length === 0 ? (
          <div className="text-sm text-muted-foreground">No reviews found in `testimonials.txt`.</div>
        ) : shouldAnimate ? (
          <div
            ref={viewportRef}
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label="Google reviews"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className="overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div ref={trackRef} className="flex gap-6 py-2 will-change-transform" style={{ transform }}>
              {loopItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="w-[min(420px,86vw)] shrink-0">
                  <GoogleReviewCard item={item} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item, index) => (
              <ScrollReveal key={item.id} delay={index * 0.08}>
                <GoogleReviewCard item={item} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
