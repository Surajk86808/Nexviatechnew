"use client";

import { useEffect, useMemo, useState } from "react";
import { Target, Network, Cog, TrendingUp, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { loadTeamMembers } from "@/lib/teamData";
import type { TeamMember } from "@/lib/parseTeam";
import TeamCard from "./TeamCard";

const steps = [
  {
    title: "Strategic Discovery",
    description:
      "We work with your team to understand business goals, technical constraints, and long-term priorities, so we focus on the problems that matter most.",
    icon: Target,
  },
  {
    title: "Architecture & Planning",
    description:
      "We design a practical, scalable architecture and define a clear execution plan aligned with your existing systems and delivery timelines.",
    icon: Network,
  },
  {
    title: "Iterative Engineering",
    description:
      "Development happens in focused iterations, with regular reviews to ensure quality, alignment, and predictable progress.",
    icon: Cog,
  },
  {
    title: "Launch & Scale",
    description:
      "We support deployment, stabilization, and performance tuning to ensure the system operates reliably as usage grows.",
    icon: TrendingUp,
  },
  {
    title: "Ongoing Improvement",
    description:
      "After launch, we continue refining the platform based on real usage, operational data, and evolving business needs.",
    icon: Sparkles,
  },
];

const faqs = [
  {
    q: "1. What services does NexviaTech provide?",
    a: "We offer end-to-end technology services including Web Development, AI & Machine Learning, Generative AI solutions, Workflow Automation, Data Analytics, and enterprise backend systems. We handle everything from architecture to deployment.",
  },
  {
    q: "2. How long does it take to complete a project?",
    a: "A standard web project takes 3-6 weeks. AI/automation projects typically take 6-12 weeks depending on complexity. We share a clear timeline during our discovery call before any work begins.",
  },
  {
    q: "3. How much does a typical project cost?",
    a: "Projects start from ₹25,000 for basic web development and scale based on complexity. AI and automation projects are scoped individually. We provide a detailed quote after understanding your requirements — no hidden costs.",
  },
  {
    q: "4. Do you work with startups or only established companies?",
    a: "Both. We work with early-stage startups building their first product and with established companies modernizing their systems. Our process adapts to your stage and budget.",
  },
  {
    q: "5. Will I be involved during the development process?",
    a: "Absolutely. We follow an iterative process with regular check-ins, demos, and reviews at every stage. You stay informed and in control throughout the entire project.",
  },
  {
    q: "6. What technologies do you use?",
    a: "We leverage modern technologies such as AI/ML frameworks, React, FastAPI/Django, cloud platforms, and scalable databases to build future-ready solutions.",
  },
  {
    q: "7. Do you provide post-launch support?",
    a: "Yes. We offer ongoing support, performance optimization, and feature enhancements to ensure your product continues to grow.",
  },
  {
    q: "8. How do we get started?",
    a: "Reach out through our contact form or schedule a discovery call. We will understand your vision and recommend the best path forward.",
  },
  {
    q: "9. Why should we choose NexviaTech?",
    a: "We combine technical expertise with strategic thinking to deliver solutions that are not only functional but built for long-term growth, quality, scalability, and measurable business impact.",
  },
];

type ProcessTeamFaqSectionProps = {
  includeProcess?: boolean;
  includeTeam?: boolean;
  includeFaqs?: boolean;
};

const ProcessTeamFaqSection = ({
  includeProcess = true,
  includeTeam = true,
  includeFaqs = true,
}: ProcessTeamFaqSectionProps) => {
  const REFRESH_MS = 4000;
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState<string | null>(null);
  const visibleFaqs = useMemo(() => (showAllFaqs ? faqs : faqs.slice(0, 5)), [showAllFaqs]);

  useEffect(() => {
    let mounted = true;
    const run = async (silent = false) => {
      try {
        if (!silent) {
          setTeamLoading(true);
          setTeamError(null);
        }
        const data = await loadTeamMembers();
        if (!mounted) return;
        setTeamMembers(data);
      } catch {
        if (!mounted) return;
        setTeamMembers([]);
        setTeamError("Unable to load team right now.");
      } finally {
        if (mounted && !silent) setTeamLoading(false);
      }
    };

    if (includeTeam) {
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
    }

    return () => {
      mounted = false;
    };
  }, [includeTeam]);

  return (
    <>
      {includeProcess && (
      <section id="our-process" className="pb-20">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-[linear-gradient(160deg,hsl(var(--background))_0%,hsl(var(--secondary))_55%,hsl(var(--background))_100%)] p-6 md:p-10 process-grid-bg">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,hsl(var(--primary)/0.14)_0%,transparent_42%),radial-gradient(circle_at_85%_82%,hsl(var(--accent)/0.08)_0%,transparent_42%)]" />

            <div className="relative z-10 mb-10 max-w-3xl mx-auto text-center">
              <p className="section-label mb-3">Our Process</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter-custom text-foreground mb-4">From Vision to Scale</h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                A proven framework designed to transform ambitious ideas into powerful, scalable digital products.
              </p>
            </div>

            <div className="relative z-10 overflow-x-auto pb-3 hide-scrollbar">
              <div className="flex flex-col md:min-w-max md:flex-row md:items-start mx-auto">
                {steps.map((step, idx) => (
                  <div key={`flow-${step.title}`} className="flex flex-col md:flex-row md:items-center">
                    <article className="group process-step-panel w-full md:w-[320px] p-5 md:p-6 rounded-xl premium-card">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-full border border-primary/40 bg-primary/15 flex items-center justify-center text-primary text-sm font-semibold shadow-[0_0_20px_rgba(14,165,255,0.35)] group-hover:shadow-[0_0_32px_rgba(14,165,255,0.5)] transition-all duration-300">
                          {idx + 1}
                        </div>
                        <step.icon className="w-5 h-5 text-primary/90" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{step.description}</p>
                    </article>

                    {idx < steps.length - 1 && (
                      <div className="py-3 md:py-0 md:w-20 lg:w-24 md:px-2 flex justify-center">
                        <div className="h-10 w-[2px] md:h-[2px] md:w-full process-data-line rounded-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {includeTeam && (
      <section id="our-team" className="pb-20">
        <div className="container mx-auto px-6">
          <p className="section-label mb-3">Our Team</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight-custom text-gradient mb-8">The Minds Behind NexviaTech</h2>

          {teamLoading ? (
            <div className="text-muted-foreground text-sm">Loading team...</div>
          ) : teamError ? (
            <div className="text-muted-foreground text-sm">{teamError}</div>
          ) : teamMembers.length === 0 ? (
            <div className="text-muted-foreground text-sm">No team members found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {includeFaqs && (
      <section id="faqs" className="pb-20">
        <div className="container mx-auto px-6">
          <div className="glass border-glow rounded-xl p-6 md:p-8 text-left">
            <p className="text-left section-label mb-3">FAQs</p>
            <h2 className="text-left text-3xl md:text-4xl font-bold tracking-tight-custom text-gradient mb-6">
              Questions Clients Ask Before Building
            </h2>

            <Accordion type="single" collapsible className="w-full">
              {visibleFaqs.map((item, idx) => (
                <AccordionItem key={item.q} value={`item-${idx}`} className="faq-item border-0 px-4">
                  <AccordionTrigger className="text-left text-foreground hover:no-underline py-5 text-xl font-semibold">
                    {item.q}
                    <span className="faq-trigger-icon" />
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowAllFaqs((value) => !value)}
                className="btn-tag text-sm font-medium"
                suppressHydrationWarning
              >
                {showAllFaqs ? "Show Less" : "Read More"}
              </button>
            </div>
          </div>
        </div>
      </section>
      )}
    </>
  );
};

export default ProcessTeamFaqSection;
