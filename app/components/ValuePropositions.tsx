import { ShieldCheck, Gauge, Workflow, LineChart } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const valueItems = [
  {
    title: "Reduce Operational Costs",
    description: "We help enterprise teams lower infrastructure and operational spend through targeted cloud optimization and automation initiatives.",
    icon: Gauge,
  },
  {
    title: "Enterprise-Grade Security",
    description: "Security is integrated from the start, with encryption by default, access controls, and processes designed to support compliance requirements.",
    icon: ShieldCheck,
  },
  {
    title: "Faster, More Predictable Delivery",
    description: "Our delivery frameworks help teams shorten release cycles while maintaining stability and production reliability.",
    icon: Workflow,
  },
  {
    title: "Measurable Business Impact",
    description: "Each engagement is tracked against relevant KPIs such as system reliability, delivery performance, and operational efficiency.",
    icon: LineChart,
  },
];

const ValuePropositions = () => {
  return (
    <section id="value-props" className="py-20">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <p className="section-label mb-4">Why Teams Choose NexviaTech</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter-custom text-gradient mb-14">Built for Enterprise Scale</h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {valueItems.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 0.08}>
              <article className="premium-card rounded-xl p-8 h-full">
                <item.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuePropositions;
