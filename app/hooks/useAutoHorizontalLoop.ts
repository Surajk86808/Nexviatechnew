import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  enabled: boolean;
  speedPxPerSecond?: number;
};

export const useAutoHorizontalLoop = ({ enabled, speedPxPerSecond = 26 }: Options) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);
  const baseWidthRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const [transform, setTransform] = useState("translate3d(0px, 0, 0)");
  const [paused, setPaused] = useState(false);

  const recalculate = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      baseWidthRef.current = 0;
      return;
    }
    baseWidthRef.current = track.scrollWidth / 2;
  }, []);

  useEffect(() => {
    if (!enabled) {
      offsetRef.current = 0;
      setTransform("translate3d(0px, 0, 0)");
      return;
    }

    recalculate();

    const onResize = () => recalculate();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, recalculate]);

  useEffect(() => {
    if (!enabled || paused) {
      lastTimestampRef.current = null;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const step = (timestamp: number) => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
      const deltaMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      const baseWidth = baseWidthRef.current;
      if (baseWidth > 0) {
        const deltaPx = (speedPxPerSecond * deltaMs) / 1000;
        offsetRef.current -= deltaPx;

        if (Math.abs(offsetRef.current) >= baseWidth) {
          offsetRef.current += baseWidth;
        }

        setTransform(`translate3d(${offsetRef.current}px, 0, 0)`);
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [enabled, paused, speedPxPerSecond]);

  const nudgeBy = (deltaPx: number) => {
    if (!enabled) return;
    const baseWidth = baseWidthRef.current;
    if (!baseWidth) return;

    offsetRef.current += deltaPx;

    if (offsetRef.current > 0) offsetRef.current -= baseWidth;
    if (Math.abs(offsetRef.current) >= baseWidth) offsetRef.current += baseWidth;

    setTransform(`translate3d(${offsetRef.current}px, 0, 0)`);
  };

  return {
    viewportRef,
    trackRef,
    transform,
    paused,
    setPaused,
    nudgeBy,
    recalculate,
  };
};
