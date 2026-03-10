import { useEffect, useMemo, useRef, useState } from "react";
import { Quote, UserRound } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { loadTestimonials } from "@/lib/testimonialsData";
import type { TestimonialData } from "@/lib/parseTestimonials";
import { useAutoHorizontalLoop } from "@/hooks/useAutoHorizontalLoop";

const trustStats = [
  { label: "Average Cost Reduction", value: "40%", subtitle: "Measured across automation projects", number: 40, suffix: "%" },
  { label: "Deployment Speed Improvement", value: "3x", subtitle: "Achieved on Yello Premier League platform", number: 3, suffix: "x" },
  { label: "Platform Availability", value: "99.9%", subtitle: "Maintained on Your Doc Talk system", number: 99.9, suffix: "%" },
  { label: "Transactions Processed", value: "10M+", subtitle: "Across all client platforms combined", number: 10, suffix: "M+" },
];

const TestimonialCard = ({ item }: { item: TestimonialData }) => (
  <article className="interactive-card glow-card premium-card rounded-[16px] p-8 h-full flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <Quote className="w-6 h-6 text-primary/50 shrink-0" />
      {item.image ? (
        <img
          src={item.image}
          alt={`${item.name} portrait`}
          className="w-10 h-10 rounded-full object-cover border border-white/15"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.03] flex items-center justify-center text-primary/60">
          <UserRound className="w-4 h-4" />
        </span>
      )}
    </div>
    <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-6">"{item.quote}"</p>
    <div>
      <p className="text-foreground font-medium text-sm">{item.name}</p>
      <p className="text-muted-foreground text-xs">{item.role}, {item.company}</p>
    </div>
  </article>
);

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
        setError("Unable to load testimonials right now.");
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
  const { viewportRef, trackRef, transform, setPaused, nudgeBy, recalculate } = useAutoHorizontalLoop({
    enabled: shouldAnimate,
    speedPxPerSecond: 24,
  });

  useEffect(() => {
    recalculate();
  }, [loopItems.length, recalculate]);

  return (
    <section id="testimonials" className="py-24 relative">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <p className="section-label mb-4">SOCIAL PROOF</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter-custom text-gradient mb-10">Results Enterprise Teams Can Measure</h2>
        </ScrollReveal>

        <div ref={statsRef} className="rounded-xl border border-border bg-[linear-gradient(180deg,rgba(59,130,246,0.12),rgba(13,20,33,0.75))] p-2 mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
            {trustStats.map((item, index) => (
              <ScrollReveal key={item.label} delay={index * 0.06}>
                <div className={`p-5 text-left ${index % 4 !== 3 ? "lg:border-r lg:border-white/10" : ""}`}>
                  <p className="text-5xl md:text-6xl font-bold text-foreground drop-shadow-[0_0_16px_rgba(59,130,246,0.4)]">
                    {item.number % 1 === 0 ? Math.round(animatedNumbers[index]) : animatedNumbers[index].toFixed(1)}
                    {item.suffix}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">{item.label}</p>
                  <p className="text-xs text-muted-foreground/80 mt-2 font-mono">{item.subtitle}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-muted-foreground text-sm">Loading testimonials...</div>
        ) : error ? (
          <div className="text-muted-foreground text-sm">{error}</div>
        ) : testimonials.length === 0 ? (
          <div className="text-muted-foreground text-sm">No client stories found.</div>
        ) : shouldAnimate ? (
          <div
            ref={viewportRef}
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label="Client stories"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                nudgeBy(-160);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                nudgeBy(160);
              }
            }}
            className="overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div ref={trackRef} className="flex gap-6 will-change-transform" style={{ transform }}>
              {loopItems.map((item, i) => (
                <div key={`${item.id}-${i}`} className="w-[min(420px,86vw)] shrink-0">
                  <TestimonialCard item={item} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <ScrollReveal key={item.id} delay={i * 0.1}>
                <TestimonialCard item={item} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
