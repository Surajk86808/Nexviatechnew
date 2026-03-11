"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";

const ThemeToggle = dynamic(() => import("./ThemeToggle"), {
  ssr: false,
  loading: () => <div className="h-10 w-10 rounded-full border border-border bg-card" aria-hidden="true" />,
});

const SECTION_OFFSET = 112;
const SECTION_IDS = ["result", "reviews", "why-us", "solutions", "selected-works", "team", "resources"] as const;
const HOME_NAV_LINKS = [
  { label: "Result", href: "#result" },
  { label: "Reviews", href: "#reviews" },
  { label: "Why us", href: "#why-us" },
  { label: "Solutions", href: "#solutions" },
  { label: "Selected Works", href: "#selected-works" },
  { label: "Team", href: "#team" },
  { label: "Resources", href: "#resources" },
] as const;

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHash, setActiveHash] = useState<string>("#result");
  const pathname = usePathname();
  const router = useRouter();
  const isHowWeWorkPage = pathname === "/how-we-work";
  const isProjectsPage = pathname === "/projects" || pathname === "/works";

  useEffect(() => {
    router.prefetch("/launch-project");
    router.prefetch("/how-we-work");
  }, [router]);

  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(height > 0 ? Math.min(100, (top / height) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const scrollToHash = (hash: string) => {
      const id = hash.replace(/^#/, "");
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      requestAnimationFrame(() => {
        const top = target.getBoundingClientRect().top + window.scrollY - SECTION_OFFSET;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      });
    };

    if (pathname === "/" && window.location.hash) {
      scrollToHash(window.location.hash);
    }

    const onHashChange = () => {
      if (pathname === "/") {
        scrollToHash(window.location.hash);
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;

    const syncActiveSection = () => {
      const scrollMarker = window.scrollY + SECTION_OFFSET + 8;
      let nextActive = `#${SECTION_IDS[0]}`;

      for (const id of SECTION_IDS) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.offsetTop <= scrollMarker) {
          nextActive = `#${id}`;
        }
      }

      setActiveHash((current) => (current === nextActive ? current : nextActive));

      if (window.location.hash !== nextActive) {
        window.history.replaceState(null, "", `${pathname}${nextActive}`);
      }
    };

    syncActiveSection();
    window.addEventListener("scroll", syncActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", syncActiveSection);
  }, [pathname]);

  const handleHashNavigation = (hash: string) => {
    const id = hash.replace(/^#/, "");
    const target = document.getElementById(id);
    if (!target) return false;
    const top = target.getBoundingClientRect().top + window.scrollY - SECTION_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    setMobileOpen(false);
    setActiveHash(hash);
    window.history.replaceState(null, "", `${pathname}${hash}`);
    return true;
  };

  const navLinks = isProjectsPage
    ? []
    : isHowWeWorkPage
    ? [
        { label: "Home", to: "/" },
        ...HOME_NAV_LINKS.map((link) => ({ label: link.label, to: `/${link.href}` })),
      ]
    : [...HOME_NAV_LINKS];

  const renderLink = (link: { label: string; href?: string; to?: string }, mobile = false) => {
    const linkHash = link.href ?? (link.to?.startsWith("/#") ? link.to.slice(1) : undefined);
    const isActive = pathname === "/" && !!linkHash && linkHash === activeHash;
    const className = mobile
      ? `text-base transition-colors nav-link-dot py-2 ${
          isActive ? "text-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
        }`
      : `text-sm transition-colors nav-link-dot ${
          isActive ? "text-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
        }`;

    if (link.to) {
      if (pathname === "/" && link.to.startsWith("/#")) {
        const hash = link.to.slice(1);
        return (
          <a
            key={link.label}
            href={hash}
            className={className}
            onClick={(event) => {
              event.preventDefault();
              handleHashNavigation(hash);
            }}
          >
            {link.label}
          </a>
        );
      }

      return (
        <Link key={link.label} href={link.to} className={className} onClick={() => setMobileOpen(false)}>
          {link.label}
        </Link>
      );
    }

    return (
      <a
        key={link.label}
        href={link.href}
        className={className}
        onClick={(event) => {
          if (link.href && link.href.startsWith("#")) {
            event.preventDefault();
            handleHashNavigation(link.href);
            return;
          }
          setMobileOpen(false);
        }}
      >
        {link.label}
      </a>
    );
  };

  return (
    <header className="nexviatech-header fixed top-0 left-0 right-0 z-50">
      <div className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-[#3b82f6] via-[#60a5fa] to-[#2563eb] transition-[width] duration-150" style={{ width: `${scrollProgress}%` }} />

      <div className="max-w-7xl mx-auto mt-3 px-4">
        <div className="glass-strong rounded-full px-5 py-2.5 flex items-center justify-between shadow-[0_14px_44px_rgba(15,23,42,0.12)] dark:shadow-[0_10px_50px_rgba(0,0,0,0.38)] border-b border-b-[rgba(59,130,246,0.1)]">
          <Link href="/" className="relative flex items-center gap-2">
            <span className="pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.22),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(59,130,246,0.35),transparent_70%)] blur-lg" />
            <BrandLogo />
          </Link>

          <nav className="hidden md:flex items-center gap-7 ml-auto">
            {navLinks.map((link) => renderLink(link))}
            <ThemeToggle />
            <Link
              href="/launch-project"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80"
              suppressHydrationWarning
            >
              Get Started
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="text-foreground h-10 w-10 rounded-full border border-border bg-card inline-flex items-center justify-center"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              suppressHydrationWarning
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden fixed inset-0 z-40 transition ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          suppressHydrationWarning
        />
        <nav
          className={`absolute right-0 top-0 h-full w-[min(82vw,360px)] border-l border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,248,255,0.94))] dark:bg-[linear-gradient(180deg,rgba(13,20,33,0.96),rgba(8,12,20,0.98))] p-6 flex flex-col gap-5 shadow-[0_20px_60px_rgba(15,23,42,0.16)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="mt-14 flex flex-col gap-2">{navLinks.map((link) => renderLink(link, true))}</div>
          <Link
            href="/launch-project"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-auto text-sm text-center"
            onClick={() => setMobileOpen(false)}
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
