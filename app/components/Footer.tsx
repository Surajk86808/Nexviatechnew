import Link from "next/link";
import {
  Brain,
  Sparkles,
  Workflow,
  Globe,
  BarChart3,
  ArrowUp,
  Instagram,
  Linkedin,
  X,
} from "lucide-react";

const serviceLinks = [
  { label: "AI & Machine Learning", icon: Brain },
  { label: "Gen AI", icon: Sparkles },
  { label: "Automation", icon: Workflow },
  { label: "Web", icon: Globe },
  { label: "Data Analytics", icon: BarChart3 },
];

const ClutchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1.25 14.5h-2.5v-2.5h2.5v2.5zm0-4h-2.5V7.5h2.5v5z" />
  </svg>
);

const Footer = () => {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="nexviatech-footer relative overflow-hidden border-t border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(237,246,255,0.96))] pt-20 pb-8 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,12,20,0.92),rgba(8,12,20,1))]">
      <div className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent animate-pulse" />
      <div className="pointer-events-none absolute inset-x-0 top-8 text-center text-[clamp(3rem,16vw,12rem)] font-bold tracking-[0.14em] text-slate-900/[0.03] select-none dark:text-white/[0.03]">
        NEXVIATECH
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-14 items-start">
          <div className="flex flex-col text-left">
            <img src="/nexviatechbgwhite.png" alt="Nexviatech Official Logo" className="h-10 w-auto mb-4 dark:hidden" />
            <img src="/nextviatechbgblue.png" alt="Nexviatech Official Logo" className="hidden h-10 w-auto mb-4 dark:block" />
            <p className="text-muted-foreground text-sm leading-relaxed mb-2">
              We help enterprise teams modernize digital systems, reduce delivery risk, and scale secure platforms with measurable outcomes.
            </p>
            <p className="text-xs italic text-muted-foreground/80">Engineered for ambitious products.</p>
          </div>

          <div className="flex flex-col text-left">
            <h4 className="section-label mb-5">Solutions</h4>
            <ul className="space-y-3">
              {serviceLinks.map((item) => (
                <li key={item.label}>
                  <a href="#solutions" className="flex items-center gap-2 text-muted-foreground text-sm hover:text-primary transition-colors">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col text-left">
            <h4 className="section-label mb-5">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://x.com/nexviatech1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-muted-foreground text-sm hover:text-foreground" aria-label="X">
                  <X className="w-4 h-4" />
                  <span>X</span>
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/company/nexviatech1/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-muted-foreground text-sm hover:text-foreground" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/nexviatech_solutions/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-muted-foreground text-sm hover:text-foreground" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a href="https://clutch.co/profile/nexviatech" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-muted-foreground text-sm hover:text-foreground" aria-label="Clutch">
                  <ClutchIcon className="w-4 h-4" />
                  <span>Clutch</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col text-left">
            <h4 className="section-label mb-5">Contact</h4>
            <ul className="space-y-3">
              <li><a href="mailto:info@nexviatech.online" className="text-muted-foreground text-sm hover:text-primary transition-colors">info@nexviatech.online</a></li>
              <li><a href="tel:+916299846516" className="text-muted-foreground text-sm hover:text-primary transition-colors">+91 6299846516</a></li>
            </ul>
            <div className="mt-6 space-y-1.5 text-xs text-muted-foreground/80">
              <p>Based in Bengaluru, India - serving clients globally.</p>
              <p>Remote-first agency - IST (UTC +5:30) - Mon-Sat, 10AM-7PM.</p>
              <p>We work with clients across India, US, UK, and Southeast Asia.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/60">
          <p>&copy;2026 Nexviatech</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Terms of Service</Link>
            <button onClick={handleBackToTop} className="btn-tag inline-flex items-center gap-1" suppressHydrationWarning>
              Back to Top
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
