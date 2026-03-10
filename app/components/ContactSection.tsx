"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { AtSign, Phone, Send } from "lucide-react";
import { submitContactMessage } from "@/lib/api";

type InquiryType = "query" | "project" | "support";

const ContactSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [inquiryType] = useState<InquiryType>("query");
  const [subject] = useState("Contact Us");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const composedMessage = [`Inquiry Type: ${inquiryType}`, `Subject: ${subject}`, "", message].join("\n");
      await submitContactMessage({ name, email, message: composedMessage });
      setFeedback({ type: "success", text: "Message sent successfully. I will get back to you soon." });
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send message.";
      setFeedback({ type: "error", text: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="mt-2 px-4 sm:px-6 pb-6">
      <div className="mx-auto w-full max-w-[92vw] 2xl:max-w-[88vw]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-8 lg:gap-20 py-4 lg:py-5 items-start"
        >
          <div className="pt-1 lg:pt-2 text-center lg:text-left">
            <p className="section-label mb-2.5">GET IN TOUCH</p>
            <h3 className="text-4xl lg:text-[2.95rem] font-semibold tracking-[-0.03em] text-foreground leading-[1.02]">Contact Us</h3>
            <p className="text-[0.98rem] text-muted-foreground mt-2.5 max-w-[33ch] mx-auto lg:mx-0 leading-[1.42]">
              Tell us your priorities and technical constraints. We'll outline a clear plan and next steps.
            </p>

            <div className="mt-5 space-y-2">
              <a href="mailto:info@nexviatech.online" className="flex items-center justify-center lg:justify-start gap-3 text-foreground/75 hover:text-foreground transition-colors">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/90 bg-card/60">
                  <AtSign className="h-4 w-4 text-primary" />
                </span>
                <span className="text-[1.15rem] sm:text-[1.25rem] lg:text-[1.4rem] leading-[1.08] tracking-[-0.02em]">info@nexviatech.online</span>
              </a>
              <a href="tel:6299846516" className="flex items-center justify-center lg:justify-start gap-3 text-foreground/75 hover:text-foreground transition-colors">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/90 bg-card/60">
                  <Phone className="h-4 w-4 text-primary" />
                </span>
                <span className="text-[1.15rem] sm:text-[1.25rem] lg:text-[1.4rem] leading-[1.08] tracking-[-0.02em]">+91 6299846516</span>
              </a>
            </div>

            <div className="mt-5 space-y-2 text-sm text-muted-foreground max-w-[38ch] mx-auto lg:mx-0">
              <p>📍 Based in Bengaluru, India · Serving clients globally</p>
              <p>🌐 Remote-First Agency — IST (UTC +5:30) · Mon–Sat, 10AM–7PM</p>
              <p>We work with clients across India, US, UK, and Southeast Asia.</p>
            </div>
          </div>

          <div className="premium-card rounded-xl p-4 sm:p-5 md:p-5.5 w-full max-w-[820px] lg:ml-auto">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5 text-left" suppressHydrationWarning>
              <input type="hidden" name="inquiry_type" value={inquiryType} />
              <input type="hidden" name="subject" value={subject} />
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-border/90 bg-card/70 px-4 py-2 text-base md:text-lg text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:border-primary/80 focus:ring-2 focus:ring-primary/25"
                  placeholder="Your name"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border border-border/90 bg-card/70 px-4 py-2 text-base md:text-lg text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:border-primary/80 focus:ring-2 focus:ring-primary/25"
                  placeholder="you@company.com"
                  suppressHydrationWarning
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Message</label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-border/90 bg-card/70 px-4 py-2 text-base md:text-lg text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:border-primary/80 focus:ring-2 focus:ring-primary/25 resize-none"
                  placeholder="Tell us about your goals, timeline, and current systems."
                  suppressHydrationWarning
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full text-base md:text-lg tracking-[0.01em] disabled:opacity-70"
                suppressHydrationWarning
              >
                <Send className="h-4.5 w-4.5 md:h-5 md:w-5" />
                {submitting ? "Sending..." : "Contact Us"}
              </button>

              {feedback && <p className={`text-sm ${feedback.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>{feedback.text}</p>}
              <p className="text-sm text-muted-foreground/75">We respect your privacy. No spam.</p>
            </form>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default ContactSection;
