import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/gsap";

type Particle = {
  x: number;
  y: number;
  z: number; // depth: 0 far → 1 near
  size: number;
  vx: number;
  vy: number;
  kind: 0 | 1 | 2; // square | ring | dot
  amber: boolean;
  phase: number;
};

function readInk(fallback: [number, number, number]): [number, number, number] {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--particle-rgb")
    .trim();
  const p = raw.split(",").map((n) => parseInt(n, 10));
  return p.length === 3 && p.every((n) => !Number.isNaN(n))
    ? [p[0], p[1], p[2]]
    : fallback;
}

const ACCENT = "252, 159, 48";

// A drifting field of small particles with depth-of-field and cursor parallax,
// inspired by vadimcarazan.com. Plain canvas 2D — light and dependency-free.
export function ParticleField({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;

    const ink = readInk([60, 59, 57]);

    let particles: Particle[] = [];
    const build = () => {
      const count = Math.round(Math.min(260, Math.max(80, (W * H) / 6800)));
      particles = [];
      for (let i = 0; i < count; i++) {
        const z = Math.random();
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          z,
          size: 1.5 + z * z * 14,
          vx: (Math.random() - 0.5) * (0.05 + z * 0.22),
          vy: (Math.random() - 0.5) * (0.05 + z * 0.22),
          kind: (Math.random() < 0.6 ? 0 : Math.random() < 0.55 ? 1 : 2) as 0 | 1 | 2,
          amber: Math.random() < 0.15,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      threshold: 0,
    });
    io.observe(wrap);

    // Cursor parallax (eased).
    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      tmx = (e.clientX - r.left) / W - 0.5;
      tmy = (e.clientY - r.top) / H - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const start = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const t = (now - start) / 1000;
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;

      ctx.clearRect(0, 0, W, H);
      const [ir, ig, ib] = ink;
      const inkCol = `${ir}, ${ig}, ${ib}`;

      for (const p of particles) {
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
        }
        if (p.x < -24) p.x = W + 24;
        else if (p.x > W + 24) p.x = -24;
        if (p.y < -24) p.y = H + 24;
        else if (p.y > H + 24) p.y = -24;

        const par = 80 * (0.12 + p.z);
        const bob = reduce ? 0 : Math.sin(t * 0.5 + p.phase) * 2 * p.z;
        const dx = p.x - mx * par;
        const dy = p.y - my * par + bob;
        const s = p.size;

        ctx.globalAlpha = 0.1 + p.z * 0.6;
        const col = p.amber ? ACCENT : inkCol;
        ctx.fillStyle = `rgb(${col})`;
        if (p.kind === 0) {
          ctx.fillRect(dx - s / 2, dy - s / 2, s, s);
        } else if (p.kind === 1) {
          ctx.strokeStyle = `rgb(${col})`;
          ctx.lineWidth = Math.max(1, s * 0.12);
          ctx.strokeRect(dx - s / 2, dy - s / 2, s, s);
        } else {
          ctx.beginPath();
          ctx.arc(dx, dy, s * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="particle-canvas" />
    </div>
  );
}
