import Link from "next/link";
import { ArrowUp } from "lucide-react";

const CompactFooter = () => {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border/80 py-6">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>Crafted with precision by NextEra Tech.</p>
        <div className="flex items-center gap-8">
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <button
            type="button"
            onClick={handleBackToTop}
            className="btn-tag inline-flex items-center gap-1"
            suppressHydrationWarning
          >
            Back to Top
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default CompactFooter;
