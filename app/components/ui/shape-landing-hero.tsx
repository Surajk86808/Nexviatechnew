"use client";

import { motion } from "framer-motion";
import { Component as Globe } from "@/components/ui/interactive-globe";
import AnimatedBackground from "@/components/AnimatedBackground";

type HeroGeometricProps = {
  badge?: string;
  title1?: string;
  title2?: string;
  description?: string;
};

export function HeroGeometric({
  badge = "Remote-First · Always Available",
  title1 = "Building Intelligent",
  title2 = "Digital Products",
  description = "We help startups and companies turn ideas into powerful tech products. From product development to AI automation, we design, build, and manage technology that drives real business growth — remotely, from India, for the world.",
}: HeroGeometricProps) {
  const cleanedTitle2 = title2.replace(/\s*that\s+scale\.?\s*$/i, "").trim();

  const item = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  });

  return (
    <section className="relative h-screen min-h-[720px] w-full overflow-hidden bg-background">
      <AnimatedBackground />

      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 pt-20 md:pt-[5.5rem] pb-10">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6 h-full items-center isolate">
          <div className="text-left md:pr-0 relative z-10">
            <motion.div
              {...item(0.15)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] text-muted-foreground mb-5 w-fit font-mono"
            >
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {badge}
            </motion.div>

            <div className="space-y-1 md:-mr-20 lg:-mr-28 xl:-mr-32 relative z-20">
              <motion.h1 {...item(0.3)} className="text-[clamp(2rem,4.2vw,3.6rem)] leading-[1.03] font-bold text-foreground">
                {title1}
              </motion.h1>
              <motion.h1 {...item(0.45)} className="text-[clamp(2rem,4.2vw,3.6rem)] leading-[1.03] font-bold text-foreground">
                {cleanedTitle2 || title2}
              </motion.h1>
              <motion.h1
                {...item(0.6)}
                className="text-[clamp(2rem,4.2vw,3.6rem)] leading-[1.03] font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
              >
                That Scale.
              </motion.h1>
            </div>

            <motion.p {...item(0.75)} className="mt-4 text-muted-foreground text-[0.95rem] max-w-[460px] leading-relaxed">
              {description}
            </motion.p>

            <motion.div {...item(0.95)} className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-2 font-mono text-[11px] text-muted-foreground flex-wrap">
                <span>Bengaluru, India</span>
                <span className="text-foreground/20">·</span>
                <span>Remote-First</span>
                <span className="text-foreground/20">·</span>
                <span>IST · Mon-Sat</span>
              </div>

              <a
                href="/launch-project"
                className="btn-primary text-sm"
              >
                Get Started
              </a>
              <a
                href="#portfolio"
                className="btn-ghost text-sm"
              >
                View Our Work
              </a>
            </motion.div>

            <motion.div {...item(1.2)} className="mt-6 flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-foreground text-xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
                  40%
                </p>
                <p className="text-muted-foreground text-[11px] font-mono">Cost Reduction</p>
              </div>
              <div className="w-px h-8 bg-foreground/10" />
              <div>
                <p className="text-foreground text-xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
                  3x
                </p>
                <p className="text-muted-foreground text-[11px] font-mono">Faster Delivery</p>
              </div>
              <div className="w-px h-8 bg-foreground/10" />
              <div>
                <p className="text-foreground text-xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
                  99.9%
                </p>
                <p className="text-muted-foreground text-[11px] font-mono">Uptime</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            {...item(1.35)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.35, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center justify-center h-full md:-ml-8 relative z-20 pointer-events-auto"
          >
            <Globe
              size={560}
              dotColor="rgba(100, 180, 255, ALPHA)"
              arcColor="rgba(100, 180, 255, 0.5)"
              markerColor="rgba(100, 220, 255, 1)"
              autoRotateSpeed={0.002}
            />
            <p className="text-xs text-muted-foreground/70 font-mono mt-4 text-center">// drag the globe to explore</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
