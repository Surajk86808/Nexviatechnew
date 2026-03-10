"use client";

import ScrollReveal from "./ScrollReveal";
import { ExternalLink, ChevronLeft, ChevronRight, Gauge, Users, Zap, Server, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import Link from "next/link";
import { loadPortfolioProjects, loadProjectCategories, type PortfolioProject } from "@/lib/portfolioData";
import { CARD_IMAGES_BY_KEY } from "@/lib/assetManifest";

type MetricIcon = "users" | "gauge" | "zap";

type ImpactMetric = {
  label: string;
  value: string;
  icon: MetricIcon;
};

type ResolvedProject = PortfolioProject & {
  images: string[];
  categoryTags: string[];
  impactMetrics: ImpactMetric[];
  techStackSections: { label: string; items: string[] }[];
};

type PortfolioMode = "home" | "projects";

type CardImagesApiResponse = {
  success: boolean;
  manifest?: Record<string, string[]>;
};

const normalizeKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const metricIconMap = {
  users: Users,
  gauge: Gauge,
  zap: Zap,
};

const getMetricIcon = (label: string): MetricIcon => {
  const value = label.toLowerCase();
  if (value.includes("error") || value.includes("latency") || value.includes("response") || value.includes("time")) {
    return "gauge";
  }
  if (value.includes("efficiency") || value.includes("automation") || value.includes("productivity")) {
    return "zap";
  }
  return "users";
};

const parseImpactMetrics = (impactRows: string[]): ImpactMetric[] => {
  return impactRows.map((row, index) => {
    const separatorIndex = row.indexOf(":");
    if (separatorIndex < 0) {
      return {
        label: `Impact ${index + 1}`,
        value: row,
        icon: "users",
      };
    }

    const label = row.slice(0, separatorIndex).trim() || `Impact ${index + 1}`;
    const value = row.slice(separatorIndex + 1).trim() || "Improved";
    return {
      label,
      value,
      icon: getMetricIcon(label),
    };
  });
};

const getTechStackSections = (project: PortfolioProject): { label: string; items: string[] }[] => {
  const entries: { label: string; items: string[] }[] = [
    { label: "Frontend", items: project.details.tech.frontend },
    { label: "Backend", items: project.details.tech.backend },
    { label: "Database", items: project.details.tech.database },
    { label: "Infrastructure", items: project.details.tech.infrastructure },
  ];
  return entries.filter((entry) => entry.items.length > 0);
};

const getCategoryTags = (project: PortfolioProject): string[] => {
  const tags = [project.type, ...project.tech.slice(0, 3)].filter(Boolean);
  return Array.from(new Set(tags));
};

const getProjectImages = (project: PortfolioProject, dynamicImages: Record<string, string[]>): string[] => {
  const byId = dynamicImages[normalizeKey(project.id)] || CARD_IMAGES_BY_KEY[normalizeKey(project.id)] || [];
  const byTitle = dynamicImages[normalizeKey(project.title)] || CARD_IMAGES_BY_KEY[normalizeKey(project.title)] || [];
  const candidates = byId.length ? byId : byTitle;
  const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)));

  if (uniqueCandidates.length) return uniqueCandidates;
  return ["/cards/.gitkeep", "/placeholder.svg"];
};

const ImageCarousel = ({ images, title }: { images: string[]; title: string }) => {
  const [current, setCurrent] = useState(0);
  const [resolvedImages, setResolvedImages] = useState(images);

  useEffect(() => {
    setCurrent(0);
    setResolvedImages(images);
  }, [images]);

  const handleImageError = (failedImage: string) => {
    setResolvedImages((previous) => {
      const next = previous.filter((imagePath) => imagePath !== failedImage);
      if (next.length === 0) return ["/placeholder.svg"];
      setCurrent((index) => Math.min(index, next.length - 1));
      return next;
    });
  };

  return (
    <div className="relative h-48 overflow-hidden group/carousel">
      {resolvedImages.map((img, i) => (
        <img
          key={`${img}-${i}`}
          src={img}
          alt={`${title} screenshot ${i + 1}`}
          className={`case-thumb-img absolute inset-0 w-full h-full object-cover transition-all duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${i === current ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          onError={() => handleImageError(img)}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d1421] via-transparent to-transparent" />
      {resolvedImages.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((c) => (c - 1 + resolvedImages.length) % resolvedImages.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/70 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((c) => (c + 1) % resolvedImages.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-background/70 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {resolvedImages.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-foreground/30"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Portfolio = ({ mode = "home" }: { mode?: PortfolioMode }) => {
  const REFRESH_MS = 4000;
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [activeProject, setActiveProject] = useState<ResolvedProject | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dynamicImages, setDynamicImages] = useState<Record<string, string[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const resolvedProjects = useMemo<ResolvedProject[]>(
    () =>
      projects.map((project) => ({
        ...project,
        images: getProjectImages(project, dynamicImages),
        categoryTags: getCategoryTags(project),
        impactMetrics: parseImpactMetrics(project.details.impact),
        techStackSections: getTechStackSections(project),
      })),
    [projects, dynamicImages]
  );

  const scopedProjects = useMemo<ResolvedProject[]>(() => {
    if (mode === "projects") return resolvedProjects;
    return resolvedProjects.slice(0, 3);
  }, [mode, resolvedProjects]);

  const groupedProjects = useMemo(() => {
    if (mode !== "projects") return [];

    const projectCategories = Array.from(
      new Set(scopedProjects.map((project) => (project.category || project.type).trim()).filter(Boolean))
    );

    // category.txt provides display order hints, but never hides categories present in projects.txt.
    const categoryOrder = categories.length
      ? [...categories, ...projectCategories.filter((category) => !categories.some((known) => normalizeKey(known) === normalizeKey(category)))]
      : projectCategories;

    return categoryOrder
      .map((category) => ({
        category,
        projects: scopedProjects.filter(
          (project) => normalizeKey(project.category || project.type) === normalizeKey(category)
        ),
      }))
      .filter((group) => group.projects.length > 0);
  }, [mode, categories, scopedProjects]);

  const visibleGroups = useMemo(() => {
    if (selectedCategory === "ALL") return groupedProjects;
    return groupedProjects.filter((group) => normalizeKey(group.category) === normalizeKey(selectedCategory));
  }, [groupedProjects, selectedCategory]);

  const categoryButtons = useMemo(
    () => [
      "ALL",
      ...Array.from(
        new Set([
          ...categories,
          ...groupedProjects.map((group) => group.category),
        ])
      ),
    ],
    [categories, groupedProjects]
  );

  const allVisibleProjects = useMemo(
    () => visibleGroups.flatMap((group) => group.projects),
    [visibleGroups]
  );

  useEffect(() => {
    let isMounted = true;

    const run = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setLoadError(null);
        }
        const [loadedProjects, loadedCategories, imageResponse] = await Promise.all([
          loadPortfolioProjects(),
          loadProjectCategories(),
          fetch("/api/card-images", { cache: "no-store" }).catch(() => null),
        ]);

        let manifest: Record<string, string[]> = {};
        if (imageResponse) {
          const json = (await imageResponse.json()) as CardImagesApiResponse;
          if (json?.success && json.manifest) manifest = json.manifest;
        }

        if (!isMounted) return;
        setDynamicImages(manifest);
        setCategories(loadedCategories);
        setProjects(loadedProjects);
      } catch {
        if (!isMounted) return;
        setProjects([]);
        setLoadError("Unable to load projects right now.");
      } finally {
        if (isMounted && !silent) setLoading(false);
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
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    setModalImageIndex(0);
    setModalImages(activeProject?.images || []);
  }, [activeProject]);

  useEffect(() => {
    if (mode !== "projects") return;
    const allowed = new Set(categoryButtons);
    if (!allowed.has(selectedCategory)) setSelectedCategory("ALL");
  }, [mode, categoryButtons, selectedCategory]);

  const handleModalImageError = (failedImage: string) => {
    setModalImages((previous) => {
      const next = previous.filter((imagePath) => imagePath !== failedImage);
      if (next.length === 0) return ["/placeholder.svg"];
      setModalImageIndex((index) => Math.min(index, next.length - 1));
      return next;
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <>
      <section
        id={mode === "projects" ? "projects-list" : "portfolio"}
        className={`relative ${mode === "projects" ? "py-10 md:py-12" : "py-24"}`}
      >
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <p className="section-label mb-4">
              {mode === "projects" ? "Projects" : "Case Studies Preview"}
            </p>
            <h2 className={`text-4xl md:text-5xl font-bold tracking-tighter-custom text-gradient ${mode === "projects" ? "mb-6" : "mb-10"}`}>
              {mode === "projects" ? "All Project Work" : "Success Stories with Measurable Outcomes"}
            </h2>
          </ScrollReveal>

          {loading ? (
            <div className="text-muted-foreground text-sm">Loading projects...</div>
          ) : loadError ? (
            <div className="text-muted-foreground text-sm">{loadError}</div>
          ) : mode === "projects" ? (
            allVisibleProjects.length === 0 ? (
              <div className="text-muted-foreground text-sm">No projects found.</div>
            ) : (
              <div className="space-y-14">
                <div>
                  <p className="text-left section-label mb-3">Categories</p>
                  <div className="w-full rounded-2xl border border-border/80 bg-card/40 p-3 md:p-4">
                    <div className="flex flex-wrap gap-2.5">
                    {categoryButtons.map((category) => {
                      const isActive = selectedCategory === category;
                      return (
                        <button
                          key={`chip-${category}`}
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          className={`btn-tag min-w-[110px] text-sm ${
                            isActive
                              ? "border-primary bg-primary/20 text-primary shadow-[0_0_0_1px_rgba(14,165,255,0.15)]"
                              : "text-muted-foreground"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                    </div>
                  </div>
                </div>
                {selectedCategory !== "ALL" && (
                  <h3 className="text-left text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                    {selectedCategory}
                  </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {allVisibleProjects.map((p, i) => (
                    <ScrollReveal key={`${p.id}-${p.title}-${i}`} delay={i * 0.08}>
                      <div onMouseMove={handleMouseMove} className="interactive-card case-card glow-card premium-card rounded-[16px] group/card h-full flex flex-col">
                        <ImageCarousel images={p.images} title={p.title} />
                        <div className="p-6 flex flex-col flex-1">
                          <p className="case-category text-xs font-medium tracking-wider uppercase mb-1">{p.type}</p>
                          <h3 className="case-title text-foreground font-semibold mb-2">{p.title}</h3>
                          <p className="text-muted-foreground text-xs leading-relaxed mb-3 min-h-[96px] max-h-[96px] overflow-hidden">{p.description}</p>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {p.tech.slice(0, 3).map((t) => (
                              <Badge key={t} variant="outline" className="tech-tag text-[10px] px-2 py-0 border-primary/40">
                                {t}
                              </Badge>
                            ))}
                            {p.tech.length > 3 && (
                              <Badge variant="outline" className="tech-tag text-[10px] px-2 py-0 border-primary/40">
                                +{p.tech.length - 3}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-auto">
                            <button
                              type="button"
                              onClick={() => setActiveProject((current) => (current?.id === p.id ? null : p))}
                              className="btn-ghost px-3 py-1.5 text-xs font-medium"
                            >
                              {activeProject?.id === p.id ? "Read Less" : "Read More"}
                            </button>
                            {p.liveUrl ? (
                              <a
                                href={p.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-ghost px-3 py-1.5 text-xs font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> View Live Project
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            )
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {scopedProjects.map((p, i) => (
                  <ScrollReveal key={`${p.id}-${p.title}-${i}`} delay={i * 0.08}>
                    <div onMouseMove={handleMouseMove} className="interactive-card case-card glow-card premium-card rounded-[16px] group/card h-full flex flex-col">
                      <ImageCarousel images={p.images} title={p.title} />
                      <div className="p-6 flex flex-col flex-1">
                        <p className="case-category text-xs font-medium tracking-wider uppercase mb-1">{p.type}</p>
                        <h3 className="case-title text-foreground font-semibold mb-2">{p.title}</h3>
                        <p className="text-muted-foreground text-xs leading-relaxed mb-3 min-h-[96px] max-h-[96px] overflow-hidden">{p.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {p.tech.slice(0, 3).map((t) => (
                            <Badge key={t} variant="outline" className="tech-tag text-[10px] px-2 py-0 border-primary/40">
                              {t}
                            </Badge>
                          ))}
                          {p.tech.length > 3 && (
                            <Badge variant="outline" className="tech-tag text-[10px] px-2 py-0 border-primary/40">
                              +{p.tech.length - 3}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-auto">
                          <button
                            type="button"
                            onClick={() => setActiveProject((current) => (current?.id === p.id ? null : p))}
                            className="btn-ghost px-3 py-1.5 text-xs font-medium"
                          >
                            {activeProject?.id === p.id ? "Read Less" : "Read More"}
                          </button>
                          {p.liveUrl ? (
                            <a
                              href={p.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-ghost px-3 py-1.5 text-xs font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View Live Project
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              {mode === "home" && (
                <div className="mt-10 flex justify-center">
                  <Link
                    href="/projects"
                    className="btn-tag text-sm font-semibold"
                  >
                    See All Projects
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Dialog open={!!activeProject} onOpenChange={(open) => !open && setActiveProject(null)}>
        <DialogContent
          overlayClassName="bg-slate-900/35 dark:bg-slate-950/55 backdrop-blur-[2px]"
          className="w-[min(1100px,92vw)] max-w-none h-[min(86vh,860px)] p-0 border border-slate-300/65 dark:border-white/15 bg-[linear-gradient(160deg,rgba(255,255,255,0.95)_0%,rgba(246,250,255,0.92)_100%)] dark:bg-[linear-gradient(160deg,rgba(7,13,29,0.95)_0%,rgba(5,10,24,0.92)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.45)] rounded-2xl overflow-hidden backdrop-blur-sm [&>button]:hidden"
        >
          {activeProject && (
            <div className="h-full overflow-y-auto hide-scrollbar scroll-smooth">
              <div className="relative h-[280px] md:h-[340px] overflow-hidden bg-slate-100 dark:bg-black/85">
                <img
                  src={modalImages[modalImageIndex] || "/placeholder.svg"}
                  alt={`${activeProject.title} banner ${modalImageIndex + 1}`}
                  className="w-full h-full object-contain transition-opacity duration-300"
                  onError={() => handleModalImageError(modalImages[modalImageIndex] || "")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/35 to-transparent dark:from-black/75 dark:via-black/35" />
                {modalImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous project image"
                      onClick={() => setModalImageIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/75 dark:bg-black/45 backdrop-blur-md border border-slate-300/70 dark:border-white/15 flex items-center justify-center text-foreground hover:bg-white dark:hover:bg-black/60 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next project image"
                      onClick={() => setModalImageIndex((prev) => (prev + 1) % modalImages.length)}
                      className="absolute right-16 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/75 dark:bg-black/45 backdrop-blur-md border border-slate-300/70 dark:border-white/15 flex items-center justify-center text-foreground hover:bg-white dark:hover:bg-black/60 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-4 left-6 flex items-center gap-2">
                      {modalImages.map((_, idx) => (
                        <button
                          key={`${activeProject.id}-dot-${idx}`}
                          type="button"
                          aria-label={`Go to image ${idx + 1}`}
                          onClick={() => setModalImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${idx === modalImageIndex ? "bg-primary scale-110" : "bg-slate-700/35 dark:bg-white/45 hover:bg-slate-700/50 dark:hover:bg-white/70"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                <button
                  type="button"
                  aria-label="Close project details"
                  onClick={() => setActiveProject(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/75 dark:bg-black/35 backdrop-blur-md border border-slate-300/70 dark:border-white/10 flex items-center justify-center text-foreground hover:bg-white dark:hover:bg-black/55 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activeProject.categoryTags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-white/75 dark:bg-black/40 border border-slate-300/70 dark:border-white/20 text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight max-w-3xl">{activeProject.title}</h3>
                </div>
              </div>

              <div className="p-6 md:p-7 lg:p-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold text-foreground mb-2">Overview</h4>
                      <p className="text-muted-foreground leading-relaxed">{activeProject.details.overview}</p>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-foreground mb-2">Problem We Solved</h4>
                      <p className="text-muted-foreground leading-relaxed">{activeProject.details.problem}</p>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-foreground mb-2">Solution</h4>
                      <p className="text-muted-foreground leading-relaxed">{activeProject.details.solution}</p>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-foreground mb-2">Key Features</h4>
                      <ul className="space-y-2">
                        {activeProject.details.features.length ? (
                          activeProject.details.features.map((feature) => (
                            <li key={feature} className="text-muted-foreground leading-relaxed">
                              - {feature}
                            </li>
                          ))
                        ) : (
                          <li className="text-muted-foreground leading-relaxed">- No key features provided.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold text-foreground mb-2">Impact Metrics</h4>
                      <div className="space-y-3">
                        {activeProject.impactMetrics.length ? (
                          activeProject.impactMetrics.map((m) => {
                            const MetricIcon = metricIconMap[m.icon];
                            return (
                              <div
                                key={m.label}
                                className="flex items-center justify-between rounded-xl bg-slate-900/[0.04] dark:bg-white/[0.04] border border-slate-700/15 dark:border-white/10 px-4 py-3 transition-all hover:bg-slate-900/[0.06] dark:hover:bg-white/[0.06]"
                              >
                                <div className="flex items-center gap-3">
                                  <MetricIcon className="w-4 h-4 text-primary" />
                                  <span className="text-sm text-muted-foreground">{m.label}</span>
                                </div>
                                <span className="text-sm font-semibold text-foreground">{m.value}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="rounded-xl bg-slate-900/[0.04] dark:bg-white/[0.04] border border-slate-700/15 dark:border-white/10 px-4 py-3 text-sm text-muted-foreground">
                            No impact metrics provided.
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-foreground mb-2">Tech Stack</h4>
                      {activeProject.techStackSections.length ? (
                        <div className="space-y-3">
                          {activeProject.techStackSections.map((section) => (
                            <div key={section.label}>
                              <p className="text-sm font-semibold text-foreground mb-1">{section.label}</p>
                              <div className="flex flex-wrap gap-2">
                                {section.items.map((item) => (
                                  <span key={`${section.label}-${item}`} className="px-2.5 py-1 rounded-md text-xs border border-primary/25 bg-primary/10 text-primary">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {activeProject.tech.length ? (
                            activeProject.tech.map((t) => (
                              <span key={t} className="px-2.5 py-1 rounded-md text-xs border border-primary/25 bg-primary/10 text-primary">
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No tech stack provided.</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xl font-semibold text-foreground mb-2">Deployment Scale</h4>
                      <div className="rounded-xl bg-slate-900/[0.04] dark:bg-white/[0.04] border border-slate-700/15 dark:border-white/10 p-4 flex items-start gap-3">
                        <Server className="w-4 h-4 text-primary mt-0.5" />
                        <p className="text-muted-foreground leading-relaxed">{activeProject.details.deployment}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {activeProject.liveUrl ? (
                    <a
                      href={activeProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm font-medium"
                    >
                      View Live Project
                    </a>
                  ) : null}

                  <Link
                    href="/launch-project"
                    onClick={() => setActiveProject(null)}
                    className="btn-ghost text-sm font-medium"
                  >
                    Request Similar Solution
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Portfolio;
