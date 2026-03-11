"use client";

import { motion } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import TeamPhotoDisplay from "@/components/TeamPhotoDisplay";

type HeroGeometricProps = {
  badge?: string;
  title1?: string;
  title2?: string;
  description?: string;
};

export function HeroGeometric({
  badge = "Remote-First - Always Available",
  title1 = "Building Intelligent",
  title2 = "Digital Products",
  description = "We help startups and companies turn ideas into powerful tech products. From product development to AI automation, we design, build, and manage technology that drives real business growth - remotely, from India, for the world.",
}: HeroGeometricProps) {
  const cleanedTitle2 = title2.replace(/\s*that\s+scale\.?\s*$/i, "").trim();

  const item = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  });

  return (
    <section className="nexviatech-hero relative min-h-[720px] w-full overflow-hidden bg-background md:h-screen">
      <AnimatedBackground />

      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 md:pt-[5.5rem]">
        <div className="grid h-full grid-cols-1 items-center gap-10 isolate md:grid-cols-[1.2fr_0.8fr] md:gap-6">
          <div className="relative z-10 text-left md:pr-0">
            <div className="absolute -left-6 top-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_68%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(59,130,246,0.22),transparent_68%)]" />

            <motion.div {...item(0.15)} className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="inline-flex w-full max-w-full items-center gap-2 rounded-full border border-sky-300/85 bg-[linear-gradient(135deg,rgba(219,234,254,0.94),rgba(191,219,254,0.84))] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-sky-800 shadow-[0_14px_28px_rgba(14,165,233,0.12)] sm:w-fit sm:max-w-none dark:border-[#3b82f6]/35 dark:bg-[linear-gradient(135deg,rgba(8,17,34,0.96),rgba(10,24,48,0.98))] dark:text-[#93c5fd] dark:shadow-[0_14px_34px_rgba(2,6,23,0.48),0_0_0_1px_rgba(59,130,246,0.08)]">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {badge}
              </div>

              <div className="inline-flex w-full max-w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-[1.75rem] border border-slate-300/80 bg-[linear-gradient(135deg,rgba(241,245,249,0.96),rgba(226,232,240,0.92))] px-5 py-3 font-mono text-[11px] font-medium text-slate-700 shadow-[0_14px_28px_rgba(15,23,42,0.08)] sm:w-fit sm:max-w-[32rem] sm:rounded-full sm:py-2 dark:border-blue-400/18 dark:bg-[linear-gradient(135deg,rgba(7,13,24,0.98),rgba(10,18,34,0.98))] dark:text-slate-200 dark:shadow-[0_14px_30px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(96,165,250,0.04)]">
                <span className="whitespace-nowrap">Bengaluru, India</span>
                <span className="hidden text-slate-400 sm:inline dark:text-slate-500">/</span>
                <span className="whitespace-nowrap">Remote-First</span>
                <span className="hidden text-slate-400 sm:inline dark:text-slate-500">/</span>
                <span className="whitespace-nowrap">IST / Mon-Sat</span>
              </div>
            </motion.div>

            <div className="relative z-20 space-y-1 rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/5 dark:bg-transparent dark:p-0 dark:shadow-none md:-mr-20 md:p-6 lg:-mr-28 xl:-mr-32">
              <motion.h1
                {...item(0.3)}
                className="text-[clamp(2rem,9vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground"
              >
                {title1}
              </motion.h1>
              <motion.h1
                {...item(0.45)}
                className="text-[clamp(2rem,9vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground"
              >
                {cleanedTitle2 || title2}
              </motion.h1>
              <motion.h1
                {...item(0.6)}
                className="bg-gradient-to-r from-[#60a5fa] via-[#2563eb] to-[#0ea5e9] bg-clip-text text-[clamp(2rem,9vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.02em] text-transparent"
              >
                That Scale.
              </motion.h1>
            </div>

            <motion.p
              {...item(0.75)}
              className="mt-5 max-w-[540px] text-[0.95rem] font-medium leading-[1.7] text-slate-600 dark:text-slate-300 md:text-[1rem]"
            >
              {description}
            </motion.p>

            <motion.div {...item(0.95)} className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a href="/launch-project" target="_blank" rel="noopener noreferrer" className="btn-primary text-sm sm:w-auto">
                Get Started
              </a>
              <a href="#selected-works" className="btn-ghost text-sm sm:w-auto">
                View Our Work
              </a>
            </motion.div>
          </div>

          <motion.div
            {...item(1.35)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.35, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-20 flex h-full flex-col items-center justify-center pointer-events-auto md:-ml-8"
          >
            <TeamPhotoDisplay />
            <p className="mt-4 rounded-full border border-border/70 bg-white/60 px-4 py-1.5 text-center font-mono text-xs text-muted-foreground shadow-[0_10px_24px_rgba(15,23,42,0.06)] dark:border-blue-400/15 dark:bg-[linear-gradient(135deg,rgba(9,16,32,0.9),rgba(15,23,42,0.72))] dark:text-slate-300 dark:shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
              // meet the team behind the build
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
