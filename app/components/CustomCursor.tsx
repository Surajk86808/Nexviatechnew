"use client";

import { useEffect, useRef, useState } from "react";

const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [cardActive, setCardActive] = useState(false);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(media.matches && !reduced.matches);

    const onPointerMove = (event: PointerEvent) => {
      mouse.current.x = event.clientX;
      mouse.current.y = event.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${event.clientX - 3}px, ${event.clientY - 3}px, 0)`;
      }
    };

    const onPointerOver = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      setActive(!!target.closest("a, button"));
      setCardActive(!!target.closest(".interactive-card, .premium-card, .border-glow, .glow-card"));
    };

    let raf = 0;
    const render = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.16;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x - 15}px, ${ring.current.y - 15}px, 0)`;
      }
      raf = requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerover", onPointerOver);
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerover", onPointerOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className={`pointer-events-none fixed z-[100] h-[6px] w-[6px] rounded-full bg-white transition-opacity duration-200 ${active ? "opacity-0" : "opacity-100"}`} />
      <div
        ref={ringRef}
        className={`pointer-events-none fixed z-[99] h-[30px] w-[30px] rounded-full border border-[#60a5fa]/80 transition-all duration-200 ${
          cardActive
            ? "h-[60px] w-[60px] bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.6)]"
            : active
            ? "h-[50px] w-[50px] bg-[#3b82f6]/20 border-[#3b82f6]"
            : "bg-transparent"
        }`}
      />
    </>
  );
};

export default CustomCursor;
