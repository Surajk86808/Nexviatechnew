import ScrollReveal from "./ScrollReveal";
import { Brain, Palette, Server, Smartphone, BarChart3, Shield, Sparkles, Workflow, Globe, LucideIcon } from "lucide-react";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { loadExpertise } from "@/lib/expertiseData";
import type { ExpertiseItem } from "@/lib/parseExpertise";

const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  palette: Palette,
  server: Server,
  smartphone: Smartphone,
  "bar-chart": BarChart3,
  "bar-chart-3": BarChart3,
  analytics: BarChart3,
  sparkles: Sparkles,
  workflow: Workflow,
  globe: Globe,
  "gen-ai": Sparkles,
  genai: Sparkles,
  "generative-ai": Sparkles,
  shield: Shield,
};

const getIcon = (icon: string): LucideIcon => {
  const key = icon.toLowerCase().trim();
  return iconMap[key] || Brain;
};

const Services = () => {
  const REFRESH_MS = 4000;
  const [items, setItems] = useState<ExpertiseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }
        const data = await loadExpertise();
        if (!mounted) return;
        setItems(data);
      } catch {
        if (!mounted) return;
        setItems([]);
        setError("Unable to load expertise right now.");
      } finally {
        if (mounted && !silent) setLoading(false);
      }
    };
    run();

    const intervalId = window.setInterval(() => {
      run(true);
    }, REFRESH_MS);

    const onFocus = () => {
      run(true);
    };
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const resolvedItems = useMemo(() => {
    const seen = new Set<string>();
    return items
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .map((item) => ({
        ...item,
        iconComponent: getIcon(item.icon),
      }));
  }, [items]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <section id="solutions" className="nexviatech-solutions py-24 relative">
      <div className="container mx-auto px-6">
        <div>
          <ScrollReveal>
            <p className="section-label mb-4">Solutions</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter-custom text-gradient mb-16">
              Technology Solutions Built for Performance
            </h2>
          </ScrollReveal>
        </div>

        {loading ? (
          <div className="text-muted-foreground text-sm">Loading expertise...</div>
        ) : error ? (
          <div className="text-muted-foreground text-sm">{error}</div>
        ) : resolvedItems.length === 0 ? (
          <div className="text-muted-foreground text-sm">No expertise items found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {resolvedItems.map((item, i) => {
              const Icon = item.iconComponent;
              return (
                <ScrollReveal key={item.id} delay={i * 0.08}>
                  <div onMouseMove={handleMouseMove} className="glow-card premium-card rounded-xl bg-blue-50/50 dark:bg-transparent p-8 h-full group cursor-default">
                    <Icon className="w-8 h-8 text-blue-700 dark:text-primary mb-5 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
