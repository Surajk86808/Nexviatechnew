"use client";

import { useEffect, useMemo, useState } from "react";

type HomeImageResponse = {
  success: boolean;
  images?: string[];
};

const fallbackImages = [
  "/team/images/suraj-kumar.png",
  "/team/images/umesh-sharma.png",
  "/team/images/ankit-raj.jpeg",
  "/team/images/suraj-chaudhary.png",
  "/team/images/person.png",
];

const FIRST_IMAGE_DURATION_MS = 6500;
const DEFAULT_IMAGE_DURATION_MS = 4000;
const TRANSITION_DURATION_MS = 300;
const REFRESH_MS = 10000;

export default function TeamPhotoDisplay() {
  const [images, setImages] = useState<string[]>(fallbackImages);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadImages = async () => {
      try {
        const response = await fetch("/api/home-images", { cache: "no-store" });
        const json = (await response.json()) as HomeImageResponse;
        if (!mounted) return;
        if (json.success && Array.isArray(json.images) && json.images.length > 0) {
          setImages((previous) => {
            const next = json.images!;
            if (previous.join("|") === next.join("|")) return previous;
            setCurrentPhoto((current) => (current < next.length ? current : 0));
            return next;
          });
        }
      } catch {
        if (!mounted) return;
        setImages(fallbackImages);
      }
    };

    loadImages();
    const intervalId = window.setInterval(loadImages, REFRESH_MS);
    window.addEventListener("focus", loadImages);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadImages);
    };
  }, []);

  useEffect(() => {
    let switchTimer: number | undefined;
    const displayDuration = currentPhoto === 0 ? FIRST_IMAGE_DURATION_MS : DEFAULT_IMAGE_DURATION_MS;

    const transitionTimer = window.setTimeout(() => {
      setIsTransitioning(true);

      switchTimer = window.setTimeout(() => {
        setCurrentPhoto((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, TRANSITION_DURATION_MS);
    }, displayDuration);

    return () => {
      window.clearTimeout(transitionTimer);
      if (switchTimer) {
        window.clearTimeout(switchTimer);
      }
    };
  }, [currentPhoto, images.length]);

  useEffect(() => {
    setProgressKey((prev) => prev + 1);
  }, [currentPhoto]);

  const currentImage = useMemo(() => images[currentPhoto] || fallbackImages[0], [currentPhoto, images]);

  const handleSelect = (index: number) => {
    setIsTransitioning(true);

    window.setTimeout(() => {
      setCurrentPhoto(index);
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <div className="relative flex h-[390px] w-[350px] items-center justify-center sm:h-[420px] sm:w-[390px] md:h-[470px] md:w-[420px] xl:h-[520px] xl:w-[500px]">
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#4D9EFF]/10 xl:h-[500px] xl:w-[500px]" />
        <div className="orbit orbit-slow absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#4D9EFF]/10 xl:h-[500px] xl:w-[500px]">
          <span className="pulse-dot absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#4D9EFF] to-[#6BB0FF] shadow-[0_0_24px_rgba(77,158,255,0.6)]" />
        </div>
        <div className="orbit orbit-reverse absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#4D9EFF]/5 xl:h-[400px] xl:w-[400px]">
          <span className="pulse-dot absolute bottom-[10%] left-[12%] h-2 w-2 rounded-full bg-gradient-to-br from-[#FFC107] to-[#FFD54F] shadow-[0_0_20px_rgba(255,193,7,0.45)]" />
        </div>
      </div>

      <div className="relative z-20 h-[350px] w-[350px] sm:h-[370px] sm:w-[370px] md:h-[400px] md:w-[400px] xl:h-[450px] xl:w-[450px]" tabIndex={0} aria-label={`Home showcase image ${currentPhoto + 1}`}>
        <div className="absolute inset-0 rounded-full border border-sky-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(239,246,255,0.88))] p-2 shadow-[0_18px_38px_rgba(15,23,42,0.1)] dark:border-transparent dark:bg-[linear-gradient(145deg,rgba(77,158,255,0.14),rgba(77,158,255,0.05))] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4),inset_0_0_40px_rgba(77,158,255,0.1)]">
          <div className="relative h-full w-full overflow-hidden rounded-full border border-sky-100 bg-white dark:border-white/5 dark:bg-[#141B2D]">
            <img
              key={currentImage}
              src={currentImage}
              alt={`Home showcase image ${currentPhoto + 1}`}
              className={`h-full w-full object-cover object-center transition-all duration-300 ease-out ${isTransitioning ? "scale-95 opacity-70" : "scale-100 opacity-100 photo-zoom"}`}
            />

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(107,176,255,0.08),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(255,193,7,0.05),transparent_25%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(107,176,255,0.18),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(255,193,7,0.08),transparent_25%)]" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 sm:gap-3">
        {images.map((image, index) => {
          const isActive = index === currentPhoto;
          const duration = index === 0 ? FIRST_IMAGE_DURATION_MS : DEFAULT_IMAGE_DURATION_MS;

          return (
            <button
              key={image}
              type="button"
              onClick={() => handleSelect(index)}
              className="relative h-1.5 w-10 overflow-hidden rounded-full bg-slate-200 outline-none ring-offset-0 transition hover:bg-slate-300 focus-visible:ring-2 focus-visible:ring-[#4D9EFF] dark:bg-white/10 dark:hover:bg-white/15"
              aria-label={`Show image ${index + 1}`}
              aria-pressed={isActive}
              suppressHydrationWarning
            >
              {isActive ? (
                <span
                  key={`${currentPhoto}-${progressKey}`}
                  className="absolute inset-y-0 left-0 rounded-full bg-[#4D9EFF]"
                  style={{ animation: `fillProgress ${duration}ms linear forwards` }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .orbit {
          transform-origin: center;
        }

        .orbit-slow {
          animation: rotate 20s linear infinite;
        }

        .orbit-reverse {
          animation: rotate-reverse 15s linear infinite;
        }

        .pulse-dot {
          animation: pulse 3s ease-in-out infinite;
        }

        .photo-zoom {
          animation: photoZoom 300ms ease;
        }

        @keyframes rotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes rotate-reverse {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.18);
            opacity: 0.65;
          }
        }

        @keyframes photoZoom {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(0.95);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fillProgress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
