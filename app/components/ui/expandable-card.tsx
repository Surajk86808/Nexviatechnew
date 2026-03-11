"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ExpandableCardProps {
  title: string;
  src: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  classNameExpanded?: string;
  hideExpandedImage?: boolean;
  hideExpandedHeader?: boolean;
  previewContent?: React.ReactNode;
  footerContent?: React.ReactNode;
}

export function ExpandableCard({
  title,
  src,
  description,
  children,
  className,
  classNameExpanded,
  hideExpandedImage = false,
  hideExpandedHeader = false,
  previewContent,
  footerContent,
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();

  React.useEffect(() => {
    if (!active) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("expandable-card-open");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(false);
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setActive(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("expandable-card-open");
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [active]);

  return (
    <>
      <AnimatePresence>
        {active ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-md"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 z-[80] grid place-items-center p-4 md:p-8">
            <motion.div
              layoutId={`card-${title}-${id}`}
              ref={cardRef}
              className={cn(
                "relative flex h-[min(90vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0f1c] shadow-[0_24px_90px_rgba(0,0,0,0.45)]",
                classNameExpanded
              )}
            >
              {hideExpandedImage ? null : (
                <motion.div layoutId={`image-${title}-${id}`} className="relative shrink-0 border-b border-white/10">
                  <img src={src} alt={title} className="h-64 w-full object-cover object-center md:h-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/30 to-transparent" />
                </motion.div>
              )}

              <div className="relative flex min-h-0 flex-1 flex-col">
                {hideExpandedHeader ? (
                  <motion.button
                    type="button"
                    aria-label="Close card"
                    layoutId={`button-${title}-${id}`}
                    onClick={() => setActive(false)}
                    className="absolute right-5 top-5 z-10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#0a0f1c]/80 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D9EFF]"
                    suppressHydrationWarning
                  >
                    <motion.div animate={{ rotate: active ? 45 : 0 }} transition={{ duration: 0.25 }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </motion.div>
                  </motion.button>
                ) : (
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-8">
                    <div className="min-w-0">
                      <motion.p
                        layoutId={`description-${description}-${id}`}
                        className="text-sm font-medium uppercase tracking-[0.2em] text-[#4D9EFF]"
                      >
                        {description}
                      </motion.p>
                      <motion.h3
                        id={`card-title-${id}`}
                        layoutId={`title-${title}-${id}`}
                        className="mt-2 text-2xl font-semibold text-white md:text-4xl"
                      >
                        {title}
                      </motion.h3>
                    </div>
                    <motion.button
                      type="button"
                      aria-label="Close card"
                      layoutId={`button-${title}-${id}`}
                      onClick={() => setActive(false)}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D9EFF]"
                      suppressHydrationWarning
                    >
                      <motion.div animate={{ rotate: active ? 45 : 0 }} transition={{ duration: 0.25 }}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                      </motion.div>
                    </motion.button>
                  </div>
                )}

                <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8", hideExpandedHeader && "pt-16")}>
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-6"
                  >
                    {children}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <motion.div
        role="button"
        tabIndex={0}
        aria-labelledby={`card-title-${id}`}
        layoutId={`card-${title}-${id}`}
        onClick={() => setActive(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setActive(true);
          }
        }}
        className={cn(
          "interactive-card glow-card premium-card group flex cursor-pointer flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0c1322] p-4 transition-colors hover:border-[#4D9EFF]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D9EFF]",
          className
        )}
        suppressHydrationWarning
      >
        <div className="flex flex-col gap-4">
          <motion.div layoutId={`image-${title}-${id}`} className="relative overflow-hidden rounded-[18px]">
            {previewContent ? (
              previewContent
            ) : (
              <img
                src={src}
                alt={title}
                className="h-60 w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-transparent to-transparent" />
          </motion.div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <motion.p
                layoutId={`description-${description}-${id}`}
                className="text-xs font-medium uppercase tracking-[0.2em] text-[#4D9EFF]"
              >
                {description}
              </motion.p>
              <motion.h3
                id={`card-title-${id}`}
                layoutId={`title-${title}-${id}`}
                className="mt-2 text-left text-lg font-semibold text-white"
              >
                {title}
              </motion.h3>
            </div>

            <motion.span
              layoutId={`button-${title}-${id}`}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors group-hover:bg-white/10 group-hover:text-white"
            >
              <motion.div animate={{ rotate: active ? 45 : 0 }} transition={{ duration: 0.25 }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </motion.div>
            </motion.span>
          </div>

          {footerContent ? <div className="pt-1">{footerContent}</div> : null}
        </div>
      </motion.div>
    </>
  );
}
