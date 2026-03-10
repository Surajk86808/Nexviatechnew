"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ScrollReveal from "./ScrollReveal";
import { loadVideoTestimonials } from "@/lib/videoTestimonialsData";
import type { VideoTestimonialData } from "@/lib/parseVideoTestimonials";
import { useAutoHorizontalLoop } from "@/hooks/useAutoHorizontalLoop";
import { Play } from "lucide-react";

const VideoReviewCard = ({
  review,
  index,
  onEnter,
  onLeave,
  setVideoRef,
}: {
  review: VideoTestimonialData;
  index: number;
  onEnter: (index: number) => void;
  onLeave: (index: number) => void;
  setVideoRef: (index: number, element: HTMLVideoElement | null) => void;
}) => (
  <article className="interactive-card video-card glow-card premium-card rounded-[16px] h-full flex flex-col">
    <div
      className="relative aspect-video border-b border-border/70 bg-black/50 overflow-hidden group/video"
      onMouseEnter={() => onEnter(index)}
      onMouseLeave={() => onLeave(index)}
    >
      <video
        ref={(element) => setVideoRef(index, element)}
        controls
        muted
        playsInline
        preload="metadata"
        poster={review.poster}
        className="h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/video:scale-[1.03]"
      >
        <source src={review.video} type="video/mp4" />
      </video>
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d1421] via-transparent to-transparent" />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="video-play-btn h-12 w-12 rounded-full bg-black/35 backdrop-blur-sm border border-white/25 inline-flex items-center justify-center transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
          <Play className="h-5 w-5 text-white fill-white translate-x-[1px]" />
        </span>
      </span>
    </div>
    <div className="p-6 text-left flex-1 relative">
      <span className="pointer-events-none absolute right-4 top-2 text-6xl text-white/5">"</span>
      <h3 className="video-client-name text-foreground font-semibold mb-1 text-xl transition-colors duration-300">{review.name}</h3>
      <p className="text-primary text-xs font-mono tracking-wide mb-2">{review.designation}</p>
      <p className="video-stars text-[#f59e0b] text-base mb-3">{Array.from({ length: review.stars }, () => "★").join("")}</p>
      <p className="text-muted-foreground text-sm italic relative z-10">{review.quote}</p>
    </div>
  </article>
);

const ClientReviewsSection = () => {
  const REFRESH_MS = 4000;
  const [videoReviews, setVideoReviews] = useState<VideoTestimonialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  const shouldAnimate = videoReviews.length > 3;
  const loopItems = useMemo(
    () => (shouldAnimate ? [...videoReviews, ...videoReviews] : videoReviews),
    [shouldAnimate, videoReviews]
  );

  const { viewportRef, trackRef, transform, setPaused, recalculate } = useAutoHorizontalLoop({
    enabled: shouldAnimate,
    speedPxPerSecond: 22,
  });

  useEffect(() => {
    let mounted = true;
    const run = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }
        const data = await loadVideoTestimonials();
        if (!mounted) return;
        setVideoReviews(data);
      } catch {
        if (!mounted) return;
        setVideoReviews([]);
        setError("Unable to load video reviews right now.");
      } finally {
        if (mounted && !silent) setLoading(false);
      }
    };

    run();
    const intervalId = window.setInterval(() => run(true), REFRESH_MS);
    const onFocus = () => run(true);
    window.addEventListener("focus", onFocus);
    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    recalculate();
  }, [loopItems.length, recalculate]);

  const handleVideoMouseEnter = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  };

  const handleVideoMouseLeave = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.pause();
  };

  const setVideoRef = (index: number, element: HTMLVideoElement | null) => {
    videoRefs.current[index] = element;
  };

  return (
    <section id="client-reviews" className="py-24">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <p className="section-label mb-2">CLIENT REVIEWS</p>
          <p className="text-muted-foreground text-sm mb-2">What Our Clients Say</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter-custom text-gradient mb-4">
            Real Reactions. Real Results.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg mb-10">
            Watch what our clients have to say after receiving their product.
          </p>
        </ScrollReveal>

        {loading ? (
          <div className="text-muted-foreground text-sm">Loading video reviews...</div>
        ) : error ? (
          <div className="text-muted-foreground text-sm">{error}</div>
        ) : videoReviews.length === 0 ? (
          <div className="text-muted-foreground text-sm">No video reviews found.</div>
        ) : shouldAnimate ? (
          <div
            ref={viewportRef}
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label="Video client reviews"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className="overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div ref={trackRef} className="flex gap-5 will-change-transform" style={{ transform }}>
              {loopItems.map((review, index) => (
                <div key={`${review.id}-${index}`} className="w-[min(420px,86vw)] shrink-0">
                  <VideoReviewCard review={review} index={index} onEnter={handleVideoMouseEnter} onLeave={handleVideoMouseLeave} setVideoRef={setVideoRef} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {videoReviews.map((review, index) => (
              <ScrollReveal key={review.id} delay={index * 0.08}>
                <VideoReviewCard review={review} index={index} onEnter={handleVideoMouseEnter} onLeave={handleVideoMouseLeave} setVideoRef={setVideoRef} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ClientReviewsSection;

