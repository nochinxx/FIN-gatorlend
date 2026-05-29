"use client";

import { useEffect, useRef } from "react";

const ITEMS = ["📚", "🧮", "📐", "🥼", "📓", "🔬", "📏", "💡"];

type Particle = {
  id: number;
  emoji: string;
  x: number;
  y: number;
  eaten: boolean;
  opacity: number;
  scale: number;
  bobOffset: number;
};

type Gator = {
  x: number;
  y: number;
  dir: 1 | -1;
  mouth: number; // 0–1 open amount
  mouthDir: 1 | -1;
  targetIdx: number | null;
};

export function GatorChase({ width = 600, height = 180 }: { width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    particles: Particle[];
    gator1: Gator;
    gator2: Gator;
    frame: number;
    nextId: number;
    animId: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const safeCtx = ctx;

    const W = canvas.width;
    const H = canvas.height;
    const GATOR_SIZE = 40;
    const ITEM_SIZE = 28;
    const SPEED = 1.6;

    function spawnParticle(id: number): Particle {
      return {
        id,
        emoji: ITEMS[Math.floor(Math.random() * ITEMS.length)],
        x: 80 + Math.random() * (W - 160),
        y: H / 2 + (Math.random() - 0.5) * 60,
        eaten: false,
        opacity: 1,
        scale: 1,
        bobOffset: Math.random() * Math.PI * 2,
      };
    }

    const initialParticles: Particle[] = Array.from({ length: 7 }, (_, i) =>
      spawnParticle(i)
    );

    const g1: Gator = { x: -GATOR_SIZE, y: H * 0.42, dir: 1, mouth: 0.3, mouthDir: 1, targetIdx: null };
    const g2: Gator = { x: W + GATOR_SIZE, y: H * 0.62, dir: -1, mouth: 0.3, mouthDir: 1, targetIdx: null };

    stateRef.current = { particles: initialParticles, gator1: g1, gator2: g2, frame: 0, nextId: initialParticles.length, animId: 0 };

    function findTarget(gator: Gator, particles: Particle[]): number | null {
      let best: number | null = null;
      let bestDist = Infinity;
      particles.forEach((p, i) => {
        if (p.eaten || p.opacity < 0.5) return;
        const ahead = gator.dir === 1 ? p.x > gator.x : p.x < gator.x;
        if (!ahead) return;
        const dist = Math.abs(p.x - gator.x);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      return best;
    }

    function drawGator(ctx: CanvasRenderingContext2D, g: Gator, frame: number) {
      ctx.save();
      ctx.translate(g.x, g.y);
      if (g.dir === -1) ctx.scale(-1, 1);

      const mouthAngle = g.mouth * 0.55; // radians

      // Body — green ellipse
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.ellipse(0, 0, GATOR_SIZE * 0.75, GATOR_SIZE * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail
      ctx.fillStyle = "#16a34a";
      ctx.beginPath();
      ctx.moveTo(-GATOR_SIZE * 0.7, 0);
      ctx.quadraticCurveTo(-GATOR_SIZE * 1.05, GATOR_SIZE * 0.3, -GATOR_SIZE * 1.2, GATOR_SIZE * 0.1);
      ctx.quadraticCurveTo(-GATOR_SIZE * 0.9, -GATOR_SIZE * 0.1, -GATOR_SIZE * 0.7, 0);
      ctx.fill();

      // Upper jaw
      ctx.fillStyle = "#15803d";
      ctx.save();
      ctx.rotate(-mouthAngle);
      ctx.beginPath();
      ctx.ellipse(GATOR_SIZE * 0.35, 0, GATOR_SIZE * 0.55, GATOR_SIZE * 0.22, 0, Math.PI, 0);
      ctx.fill();
      // Snout ridge
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.ellipse(GATOR_SIZE * 0.65, -GATOR_SIZE * 0.06, GATOR_SIZE * 0.12, GATOR_SIZE * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Lower jaw
      ctx.fillStyle = "#15803d";
      ctx.save();
      ctx.rotate(mouthAngle);
      ctx.beginPath();
      ctx.ellipse(GATOR_SIZE * 0.35, 0, GATOR_SIZE * 0.55, GATOR_SIZE * 0.18, 0, 0, Math.PI);
      ctx.fill();
      // Teeth
      ctx.fillStyle = "#f0fdf4";
      for (let t = 0; t < 3; t++) {
        ctx.beginPath();
        ctx.arc(GATOR_SIZE * (0.12 + t * 0.28), GATOR_SIZE * 0.08, GATOR_SIZE * 0.055, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Eye
      const eyeBob = Math.sin(frame * 0.04 + (g.dir === 1 ? 0 : 1)) * 1.5;
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(GATOR_SIZE * 0.15, -GATOR_SIZE * 0.28 + eyeBob, GATOR_SIZE * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(GATOR_SIZE * 0.17, -GATOR_SIZE * 0.27 + eyeBob, GATOR_SIZE * 0.065, 0, Math.PI * 2);
      ctx.fill();
      // Shine
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(GATOR_SIZE * 0.2, -GATOR_SIZE * 0.31 + eyeBob, GATOR_SIZE * 0.03, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function tick() {
      const state = stateRef.current!;
      const { particles, frame } = state;
      state.frame++;

      // Animate mouth chomp
      [g1, g2].forEach((g) => {
        g.mouth += g.mouthDir * 0.04;
        if (g.mouth >= 1) g.mouthDir = -1;
        if (g.mouth <= 0) g.mouthDir = 1;
      });

      // Move gators
      [g1, g2].forEach((g) => {
        const tidx = findTarget(g, particles);
        g.targetIdx = tidx;
        if (tidx !== null) {
          const target = particles[tidx];
          const dy = target.y - g.y;
          g.y += Math.sign(dy) * Math.min(Math.abs(dy) * 0.04, 1.2);
        }
        g.x += g.dir * SPEED;
        // Wrap around
        if (g.dir === 1 && g.x > W + GATOR_SIZE * 1.5) g.x = -GATOR_SIZE * 1.5;
        if (g.dir === -1 && g.x < -GATOR_SIZE * 1.5) g.x = W + GATOR_SIZE * 1.5;
      });

      // Check eating
      particles.forEach((p) => {
        if (p.eaten) return;
        [g1, g2].forEach((g) => {
          const dist = Math.hypot(g.x - p.x, g.y - p.y);
          if (dist < GATOR_SIZE * 0.7 && g.mouth > 0.4) {
            p.eaten = true;
          }
        });
      });

      // Fade eaten particles, bob live ones
      particles.forEach((p) => {
        if (p.eaten) {
          p.opacity -= 0.06;
          p.scale += 0.04;
        } else {
          p.y += Math.sin(frame * 0.025 + p.bobOffset) * 0.3;
        }
      });

      // Replace fully gone particles
      const alive = particles.filter((p) => p.opacity > 0);
      while (alive.length < 7) {
        alive.push(spawnParticle(state.nextId++));
      }
      state.particles = alive;

      // Draw
      safeCtx.clearRect(0, 0, W, H);

      // Items
      state.particles.forEach((p) => {
        if (p.opacity <= 0) return;
        safeCtx.save();
        safeCtx.globalAlpha = Math.max(0, p.opacity);
        safeCtx.font = `${ITEM_SIZE * p.scale}px serif`;
        safeCtx.textAlign = "center";
        safeCtx.textBaseline = "middle";
        safeCtx.fillText(p.emoji, p.x, p.y);
        safeCtx.restore();
      });

      // Gators
      drawGator(safeCtx, g1, frame);
      drawGator(safeCtx, g2, frame);

      state.animId = requestAnimationFrame(tick);
    }

    stateRef.current.animId = requestAnimationFrame(tick);
    return () => {
      if (stateRef.current) cancelAnimationFrame(stateRef.current.animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-hidden="true"
    />
  );
}
