"use client";

import { useEffect, useState } from "react";
import ScrollReveal from "./ScrollReveal";

type LogoItem = {
  name: string;
  src: string;
};

type LogosApiResponse = {
  success: boolean;
  logos?: LogoItem[];
};

const CompanyLogosMarquee = () => {
  const [allCompanies, setAllCompanies] = useState<LogoItem[]>([]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const response = await fetch("/api/logos", { cache: "no-store" });
        const json = (await response.json()) as LogosApiResponse;
        if (!mounted) return;
        if (json.success && Array.isArray(json.logos)) {
          setAllCompanies(json.logos);
        } else {
          setAllCompanies([]);
        }
      } catch {
        if (!mounted) return;
        setAllCompanies([]);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="client-logos" className="py-12 relative overflow-hidden bg-secondary/50 border-y border-border">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-4">Trusted By Global Teams</p>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight-custom text-gradient mb-8">
            Enterprise brands we have collaborated with
          </h3>
        </ScrollReveal>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent" />

        {allCompanies.length === 0 ? (
          <div className="text-muted-foreground text-sm px-6">No partner logos found in `public/logo`.</div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4 px-6">
            {allCompanies.map((company) => (
              <div
                key={company.src}
                className="min-w-[240px] h-24 mx-3 rounded-xl bg-white/95 border border-white/20 flex items-center justify-center px-5"
              >
                <img src={company.src} alt={`${company.name} logo`} className="max-h-14 w-full object-contain" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CompanyLogosMarquee;
