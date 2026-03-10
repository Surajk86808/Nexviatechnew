"use client";

import { cn } from "@/lib/utils";
import { useRef, useEffect, useCallback } from "react";

interface GlobeProps {
  className?: string;
  size?: number;
  dotColor?: string;
  arcColor?: string;
  markerColor?: string;
  autoRotateSpeed?: number;
  connections?: { from: [number, number]; to: [number, number] }[];
  markers?: { lat: number; lng: number; label?: string }[];
}

const DEFAULT_MARKERS = [
  { lat: 37.78, lng: -122.42, label: "San Francisco" },
  { lat: 51.51, lng: -0.13, label: "London" },
  { lat: 35.68, lng: 139.69, label: "Tokyo" },
  { lat: -33.87, lng: 151.21, label: "Sydney" },
  { lat: 1.35, lng: 103.82, label: "Singapore" },
  { lat: 28.61, lng: 77.21, label: "Delhi" },
  { lat: 25.2, lng: 85.18, label: "Patna ★ HQ" },
  { lat: 19.43, lng: -99.13, label: "Mexico City" },
  { lat: -23.55, lng: -46.63, label: "São Paulo" },
];

const DEFAULT_CONNECTIONS = [
  { from: [25.2, 85.18] as [number, number], to: [51.51, -0.13] as [number, number] }, // Patna -> London
  { from: [25.2, 85.18] as [number, number], to: [37.78, -122.42] as [number, number] }, // Patna -> SF
  { from: [25.2, 85.18] as [number, number], to: [1.35, 103.82] as [number, number] }, // Patna -> Singapore
  { from: [25.2, 85.18] as [number, number], to: [-33.87, 151.21] as [number, number] }, // Patna -> Sydney
  { from: [51.51, -0.13] as [number, number], to: [35.68, 139.69] as [number, number] }, // London -> Tokyo
  { from: [37.78, -122.42] as [number, number], to: [-23.55, -46.63] as [number, number] }, // SF -> Sao Paulo
  { from: [1.35, 103.82] as [number, number], to: [-33.87, 151.21] as [number, number] }, // Singapore -> Sydney
];

const toRad = (deg: number) => (deg * Math.PI) / 180;

const latLngToVec = (lat: number, lng: number) => {
  const phi = toRad(lat);
  const theta = toRad(lng);
  const x = Math.cos(phi) * Math.sin(theta);
  const y = Math.sin(phi);
  const z = Math.cos(phi) * Math.cos(theta);
  return { x, y, z };
};

const withAlpha = (color: string, alpha: number) => {
  if (color.includes("ALPHA")) return color.replace("ALPHA", alpha.toFixed(3));
  return color;
};

const rotatePoint = (x: number, y: number, z: number, rotX: number, rotY: number) => {
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const x1 = x * cosY - z * sinY;
  const z1 = x * sinY + z * cosY;
  const y2 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;
  return { x: x1, y: y2, z: z2 };
};

const slerp = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }, t: number) => {
  let dot = a.x * b.x + a.y * b.y + a.z * b.z;
  dot = Math.max(-1, Math.min(1, dot));
  const omega = Math.acos(dot);
  if (omega === 0) return a;
  const sinOmega = Math.sin(omega);
  const w1 = Math.sin((1 - t) * omega) / sinOmega;
  const w2 = Math.sin(t * omega) / sinOmega;
  return { x: w1 * a.x + w2 * b.x, y: w1 * a.y + w2 * b.y, z: w1 * a.z + w2 * b.z };
};

function InteractiveGlobe({
  className,
  size = 560,
  dotColor = "rgba(100, 180, 255, ALPHA)",
  arcColor = "rgba(100, 180, 255, 0.5)",
  markerColor = "rgba(100, 220, 255, 1)",
  autoRotateSpeed = 0.002,
  connections = DEFAULT_CONNECTIONS,
  markers = DEFAULT_MARKERS,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const rotYRef = useRef(0.6);
  const rotXRef = useRef(-0.18);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  const getRenderSize = useCallback(() => {
    if (typeof window === "undefined") return size;
    return window.innerWidth < 768 ? Math.min(320, size) : size;
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const updateSize = () => {
      const s = getRenderSize();
      canvas.width = Math.floor(s * dpr);
      canvas.height = Math.floor(s * dpr);
      canvas.style.width = `${s}px`;
      canvas.style.height = `${s}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    updateSize();

    const draw = (time: number) => {
      const s = getRenderSize();
      const cx = s / 2;
      const cy = s / 2;
      const radius = s * 0.37;

      if (!draggingRef.current) rotYRef.current += autoRotateSpeed;

      ctx.clearRect(0, 0, s, s);

      const glow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.35);
      glow.addColorStop(0, "rgba(59,130,246,0.18)");
      glow.addColorStop(1, "rgba(59,130,246,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(148,163,184,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      for (let lat = -80; lat <= 80; lat += 12) {
        for (let lng = -180; lng < 180; lng += 12) {
          const v = latLngToVec(lat, lng);
          const p = rotatePoint(v.x, v.y, v.z, rotXRef.current, rotYRef.current);
          if (p.z < -0.15) continue;
          const x = cx + p.x * radius;
          const y = cy - p.y * radius;
          const alpha = 0.2 + (p.z + 1) * 0.35;
          ctx.fillStyle = withAlpha(dotColor, alpha);
          ctx.beginPath();
          ctx.arc(x, y, 1.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      connections.forEach(({ from, to }) => {
        const a = latLngToVec(from[0], from[1]);
        const b = latLngToVec(to[0], to[1]);
        const segments = 48;
        let started = false;
        ctx.beginPath();
        for (let i = 0; i <= segments; i += 1) {
          const t = i / segments;
          const v = slerp(a, b, t);
          const elevated = 1 + Math.sin(Math.PI * t) * 0.17;
          const p = rotatePoint(v.x * elevated, v.y * elevated, v.z * elevated, rotXRef.current, rotYRef.current);
          if (p.z < -0.04) continue;
          const x = cx + p.x * radius;
          const y = cy - p.y * radius;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = arcColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      markers.forEach((marker) => {
        const v = latLngToVec(marker.lat, marker.lng);
        const p = rotatePoint(v.x, v.y, v.z, rotXRef.current, rotYRef.current);
        if (p.z < -0.1) return;
        const x = cx + p.x * radius;
        const y = cy - p.y * radius;
        const pulse = (Math.sin(time * 0.003 + x * 0.01) + 1) * 0.5;

        if (marker.label?.includes("Patna")) {
          ctx.fillStyle = "rgba(245,158,11,1)";
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `rgba(245,158,11,${0.22 + pulse * 0.58})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(x, y, 6 + pulse * 6, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = markerColor;
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `rgba(100, 220, 255, ${0.15 + pulse * 0.45})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 4 + pulse * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    const onResize = () => updateSize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [arcColor, autoRotateSpeed, connections, dotColor, getRenderSize, markerColor, markers]);

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = true;
    dragStartRef.current = { x: event.clientX, y: event.clientY, rotX: rotXRef.current, rotY: rotYRef.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    rotYRef.current = dragStartRef.current.rotY + dx * 0.0055;
    rotXRef.current = Math.max(-0.9, Math.min(0.9, dragStartRef.current.rotX + dy * 0.0045));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={cn("touch-none cursor-grab active:cursor-grabbing rounded-full", className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => {
        draggingRef.current = false;
      }}
      aria-label="Interactive globe"
      role="img"
    />
  );
}

export { InteractiveGlobe as Component };
export default InteractiveGlobe;
