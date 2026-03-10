"use client";

import { useEffect, useRef } from "react";

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let rafMouseId = 0;
    let pendingMouse: { x: number; y: number } | null = null;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    const connectionDistance = 140;
    const connectionDistanceSq = connectionDistance * connectionDistance;

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * DPR);
      canvas.height = Math.floor(window.innerHeight * DPR);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const screenWidth = window.innerWidth;
    const count = prefersReducedMotion ? 20 : screenWidth < 768 ? 34 : 52;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      pendingMouse = { x: e.clientX, y: e.clientY };
      if (rafMouseId) return;
      rafMouseId = requestAnimationFrame(() => {
        if (pendingMouse) {
          mouseX = pendingMouse.x;
          mouseY = pendingMouse.y;
        }
        rafMouseId = 0;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);

    const draw = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, i) => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distSq = dx * dx + dy * dy;
        if (!prefersReducedMotion && distSq < 40000) {
          p.vx += dx * 0.00003;
          p.vy += dy * 0.00003;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 163, 255, ${p.opacity})`;
        ctx.fill();

        if (prefersReducedMotion) return;
        let linked = 0;
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dSq = dx2 * dx2 + dy2 * dy2;
          if (dSq < connectionDistanceSq) {
            const strength = 1 - dSq / connectionDistanceSq;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 163, 255, ${0.05 * strength})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            linked += 1;
            if (linked >= 3) break;
          }
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      if (rafMouseId) cancelAnimationFrame(rafMouseId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
};

export default ParticleField;
