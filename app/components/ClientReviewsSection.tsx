"use client";

import { useEffect, useState } from "react";
import ScrollReveal from "./ScrollReveal";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { Star, Volume2, VolumeX } from "lucide-react";
import { loadVideoTestimonials } from "@/lib/videoTestimonialsData";
import type { VideoTestimonialData } from "@/lib/parseVideoTestimonials";

const toYouTubeEmbedUrl = (input: string, muted: boolean) => {
  try {
    const url = new URL(input);
    let videoId = "";

    if (url.hostname.includes("youtu.be")) {
      videoId = url.pathname.split("/").filter(Boolean).pop() || "";
    } else if (url.pathname.includes("/embed/")) {
      videoId = url.pathname.split("/embed/")[1]?.split("/")[0] || "";
    } else {
      videoId = url.searchParams.get("v") || "";
    }

    if (!videoId) return input;

    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
    embedUrl.searchParams.set("autoplay", "1");
    embedUrl.searchParams.set("controls", "0");
    embedUrl.searchParams.set("loop", "1");
    embedUrl.searchParams.set("playlist", videoId);
    embedUrl.searchParams.set("playsinline", "1");
    embedUrl.searchParams.set("rel", "0");
    embedUrl.searchParams.set("mute", muted ? "1" : "0");
    return embedUrl.toString();
  } catch {
    return input;
  }
};

const VideoReviewCard = ({ testimonial }: { testimonial: VideoTestimonialData }) => {
  const initials = testimonial.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const [muted, setMuted] = useState(true);

  return (
    <ExpandableCard
      title={testimonial.name}
      src="/placeholder.svg"
      description={testimonial.designation}
      className="bg-slate-100 border-slate-200 hover:scale-[1.02] transition-transform duration-300 dark:bg-[#0f1624] dark:border-[#1a2332]"
      classNameExpanded="bg-white border-slate-200 dark:bg-[#0A0F1C] dark:border-[#1a2332]"
      hideExpandedImage
      hideExpandedHeader
      footerContent={<p className="text-center text-sm text-gray-400">Click to see details</p>}
      previewContent={
        <div className="relative h-60 w-full overflow-hidden bg-black">
          <iframe
            width="100%"
            height="100%"
            src={toYouTubeEmbedUrl(testimonial.video, muted)}
            title={`${testimonial.name} preview`}
            allow="autoplay; encrypted-media; picture-in-picture"
            className="pointer-events-none h-full w-full scale-[1.18]"
          />
          <button
            type="button"
            aria-label={muted ? "Unmute preview video" : "Mute preview video"}
            onClick={(event) => {
              event.stopPropagation();
              setMuted((value) => !value);
            }}
            className="absolute bottom-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-[#0a0f1c]/85 dark:text-white dark:hover:bg-[#111a2d]"
            suppressHydrationWarning
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      }
    >
      <div className="space-y-6 w-full text-left">
        <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-200 bg-white dark:border-[#1a2332] dark:bg-black/50">
          <iframe
            width="100%"
            height="100%"
            src={toYouTubeEmbedUrl(testimonial.video, false)}
            title={`${testimonial.name} testimonial`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#4D9EFF] to-[#2563eb] text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">{testimonial.name}</h4>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#4D9EFF]">{testimonial.designation}</p>
            <p className="text-sm text-slate-500 dark:text-gray-500">{testimonial.company}</p>
          </div>
        </div>

        <div className="flex gap-1" aria-label={`${testimonial.stars} out of 5 stars`}>
          {Array.from({ length: testimonial.stars }, (_, index) => (
            <Star key={index} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
          ))}
        </div>

        <blockquote className="rounded-r-lg border-l-4 border-[#4D9EFF] bg-blue-50/70 py-2 pl-6 text-xl font-medium italic text-slate-700 dark:bg-[#0f1624]/50 dark:text-gray-200">
          "{testimonial.quote}"
        </blockquote>

        <div className="space-y-4 pt-2 text-slate-600 leading-relaxed dark:text-gray-300">
          {testimonial.fullTestimonial.map((paragraph, index) => (
            <p key={index} className="text-base">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="h-8" />
      </div>
    </ExpandableCard>
  );
};

export default function ClientReviewsSection() {
  const [testimonials, setTestimonials] = useState<VideoTestimonialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadVideoTestimonials();
        if (!mounted) return;
        setTestimonials(data);
      } catch {
        if (!mounted) return;
        setTestimonials([]);
        setError("Unable to load video testimonials right now.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="reviews" className="nexviatech-reviews relative overflow-hidden scroll-mt-32 bg-slate-50 py-24 md:scroll-mt-36 dark:bg-[#08111f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(77,158,255,0.05),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.04),_transparent_28%)] dark:bg-[radial-gradient(circle_at_top,_rgba(77,158,255,0.16),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.1),_transparent_30%)]" />

      <div className="container relative z-10 mx-auto px-6">
        <div>
          <ScrollReveal>
            <div className="mb-16 text-center">
              <p className="mb-4 text-sm font-mono text-[#4D9EFF]">// REVIEWS</p>
              <p className="mb-6 text-lg text-slate-500 dark:text-gray-400">What Our Clients Say</p>
              <h2 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white md:text-6xl">Real Reactions. Real Results.</h2>
              <p className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-gray-400">
                Open each card to watch the full testimonial and hear the client&apos;s reaction in context.
              </p>
            </div>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? <p className="text-sm text-slate-500 dark:text-gray-400">Loading video testimonials...</p> : null}
          {error ? <p className="text-sm text-slate-500 dark:text-gray-400">{error}</p> : null}
          {!loading && !error && testimonials.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-gray-400">No video testimonials found in `Video.txt`.</p>
          ) : null}
          {!loading && !error
            ? testimonials.map((testimonial, index) => (
                <ScrollReveal key={testimonial.id} delay={index * 0.08}>
                  <VideoReviewCard testimonial={testimonial} />
                </ScrollReveal>
              ))
            : null}
        </div>
      </div>
    </section>
  );
}
