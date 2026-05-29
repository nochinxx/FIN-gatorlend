"use client";

import { useEffect, useRef } from "react";

// Pixel size — all coordinates are in "pixels", scaled up by P
const P = 4;

// ── Gator sprite (pixel grid, 1 = filled) ───────────────────────────────────
// Each row: [startCol, endCol] filled, relative to gator origin (top-left of body)
// Width ≈ 24px, Height ≈ 12px (in pixel units)

function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  col: number, row: number,
  w: number, h: number
) {
  ctx.fillRect(col * P, row * P, w * P, h * P);
}

function drawGator(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  dir: 1 | -1,
  frame: number,
  mouthOpen: boolean
) {
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(cy));
  if (dir === -1) ctx.scale(-1, 1);

  ctx.fillStyle = "#e8e8e8";

  // ── Tail ──────────────────────────────────────────────
  drawPixelRect(ctx, -7, -3, 3, 2); // tail tip
  drawPixelRect(ctx, -5, -4, 2, 3); // tail mid

  // ── Body ──────────────────────────────────────────────
  drawPixelRect(ctx, -3, -5, 15, 4); // main body slab

  // ── Ridge / back bumps (top of body) ─────────────────
  drawPixelRect(ctx, 1, -7, 2, 2);
  drawPixelRect(ctx, 5, -7, 2, 2);
  drawPixelRect(ctx, 9, -7, 2, 2);

  // ── Head ──────────────────────────────────────────────
  drawPixelRect(ctx, 12, -6, 4, 3); // head block
  drawPixelRect(ctx, 16, -5, 2, 2); // snout connect

  // ── Upper jaw ─────────────────────────────────────────
  drawPixelRect(ctx, 18, -4, 6, 2);

  // ── Lower jaw (drops 1px when open) ───────────────────
  const jawDrop = mouthOpen ? 1 : 0;
  drawPixelRect(ctx, 19, -2 + jawDrop, 5, 2);

  // ── Eye (dark square inside bright area) ──────────────
  drawPixelRect(ctx, 13, -8, 3, 2); // eye bump
  ctx.fillStyle = "#080808";
  drawPixelRect(ctx, 14, -8, 2, 2); // pupil
  ctx.fillStyle = "#e8e8e8";

  // ── Nostrils ──────────────────────────────────────────
  ctx.fillStyle = "#080808";
  drawPixelRect(ctx, 22, -4, 1, 1);
  ctx.fillStyle = "#e8e8e8";

  // ── Legs — 2-frame walk cycle ─────────────────────────
  const legFrame = Math.floor(frame / 8) % 2;
  if (legFrame === 0) {
    // Front leg forward, back leg back
    drawPixelRect(ctx, 1, -1, 2, 3);   // back leg down
    drawPixelRect(ctx, 9, -2, 2, 2);   // front leg tucked
  } else {
    // Front leg down, back leg tucked
    drawPixelRect(ctx, 1, -2, 2, 2);   // back leg tucked
    drawPixelRect(ctx, 9, -1, 2, 3);   // front leg down
  }

  ctx.restore();
}

// ── Item sprites (pixel art, no emoji) ───────────────────────────────────────

type ItemKind = "book" | "calc" | "flask" | "ruler";
const ITEM_KINDS: ItemKind[] = ["book", "calc", "flask", "ruler"];

function drawItem(
  ctx: CanvasRenderingContext2D,
  kind: ItemKind,
  cx: number,
  cy: number,
  scale: number
) {
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(cy));
  ctx.scale(scale, scale);
  ctx.fillStyle = "#e8e8e8";

  if (kind === "book") {
    // Book: stacked pages with spine
    drawPixelRect(ctx, -3, -4, 6, 8); // cover
    ctx.fillStyle = "#080808";
    drawPixelRect(ctx, -3, -4, 1, 8); // spine
    ctx.fillStyle = "#e8e8e8";
    drawPixelRect(ctx, -1, -3, 3, 1); // page line
    drawPixelRect(ctx, -1, -1, 3, 1);
    drawPixelRect(ctx, -1, 1, 3, 1);
  } else if (kind === "calc") {
    // Calculator: rect with button grid
    drawPixelRect(ctx, -3, -5, 6, 10); // body
    ctx.fillStyle = "#080808";
    drawPixelRect(ctx, -2, -4, 4, 2);  // screen
    // Buttons
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        drawPixelRect(ctx, -2 + c * 2, 0 + r * 2, 1, 1);
      }
    }
    ctx.fillStyle = "#e8e8e8";
  } else if (kind === "flask") {
    // Flask/beaker: wide bottom, narrow neck
    drawPixelRect(ctx, -1, -5, 2, 2);  // neck
    drawPixelRect(ctx, -2, -3, 4, 1);  // shoulder
    drawPixelRect(ctx, -3, -2, 6, 5);  // body
    ctx.fillStyle = "#080808";
    drawPixelRect(ctx, -1, -4, 2, 1);  // inner neck
    ctx.fillStyle = "#e8e8e8";
    drawPixelRect(ctx, -2, 0, 3, 1);   // liquid line
  } else {
    // Ruler: long thin horizontal bar with tick marks
    drawPixelRect(ctx, -5, -1, 10, 3);
    ctx.fillStyle = "#080808";
    for (let t = -3; t <= 3; t += 2) {
      drawPixelRect(ctx, t, -1, 1, 1);
    }
    ctx.fillStyle = "#e8e8e8";
  }

  ctx.restore();
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Particle = {
  id: number;
  kind: ItemKind;
  x: number;
  y: number;
  baseY: number;
  eaten: boolean;
  opacity: number;
  scale: number;
  bobOffset: number;
};

type Gator = {
  x: number;
  y: number;
  dir: 1 | -1;
  mouth: number;
  mouthDir: 1 | -1;
  targetIdx: number | null;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function GatorChase({
  width = 600,
  height = 300,
}: {
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    particles: Particle[];
    gator: Gator;
    frame: number;
    nextId: number;
    animId: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxRaw = canvas.getContext("2d");
    if (!ctxRaw) return;
    const ctx = ctxRaw;

    const W = canvas.width;
    const H = canvas.height;
    const GATOR_BODY_W = 24 * P;
    const SPEED = 1.6;
    const EAT_DIST = GATOR_BODY_W * 0.6;
    const MARGIN = 40;

    // Spawn items scattered across the full 2D canvas
    function spawn(id: number): Particle {
      const baseY = MARGIN + Math.random() * (H - MARGIN * 2);
      return {
        id,
        kind: ITEM_KINDS[Math.floor(Math.random() * ITEM_KINDS.length)],
        x: MARGIN + Math.random() * (W - MARGIN * 2),
        y: baseY,
        baseY,
        eaten: false,
        opacity: 1,
        scale: 1,
        bobOffset: Math.random() * Math.PI * 2,
      };
    }

    const particles: Particle[] = Array.from({ length: 10 }, (_, i) => spawn(i));

    const gator: Gator = {
      x: -GATOR_BODY_W,
      y: H / 2,
      dir: 1,
      mouth: 0,
      mouthDir: 1,
      targetIdx: null,
    };

    stateRef.current = {
      particles,
      gator,
      frame: 0,
      nextId: particles.length,
      animId: 0,
    };

    function nearestAhead(g: Gator, parts: Particle[]): number | null {
      let best: number | null = null;
      let bestDist = Infinity;
      parts.forEach((p, i) => {
        if (p.eaten || p.opacity < 0.5) return;
        const ahead = g.dir === 1 ? p.x > g.x : p.x < g.x;
        if (!ahead) return;
        // Weight by horizontal distance primarily, slight vertical penalty
        const d = Math.abs(p.x - g.x) + Math.abs(p.baseY - g.y) * 0.3;
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }

    function tick() {
      const s = stateRef.current!;
      s.frame++;
      const { frame, gator: g } = s;

      // Mouth chomp
      g.mouth += g.mouthDir * 0.06;
      if (g.mouth >= 1) g.mouthDir = -1;
      if (g.mouth <= 0) g.mouthDir = 1;

      // Find nearest target ahead, track vertically
      const tidx = nearestAhead(g, s.particles);
      g.targetIdx = tidx;
      if (tidx !== null) {
        const target = s.particles[tidx];
        const dy = target.baseY - g.y;
        g.y += Math.sign(dy) * Math.min(Math.abs(dy) * 0.05, 2);
      }

      // Move horizontally
      g.x += g.dir * SPEED;

      // Wrap: flip direction when leaving screen, reposition on opposite side
      if (g.dir === 1 && g.x > W + GATOR_BODY_W) {
        g.x = -GATOR_BODY_W;
        g.dir = 1;
      }
      if (g.dir === -1 && g.x < -GATOR_BODY_W) {
        g.x = W + GATOR_BODY_W;
        g.dir = -1;
      }

      // Eat
      s.particles.forEach((p) => {
        if (p.eaten) return;
        const jawX = g.dir === 1 ? g.x + GATOR_BODY_W * 0.85 : g.x - GATOR_BODY_W * 0.85;
        const dist = Math.hypot(jawX - p.x, g.y - p.baseY);
        if (dist < EAT_DIST && g.mouth > 0.4) p.eaten = true;
      });

      // Animate particles
      s.particles.forEach((p) => {
        if (p.eaten) {
          p.opacity -= 0.06;
          p.scale += 0.05;
        } else {
          p.y = p.baseY + Math.sin(frame * 0.025 + p.bobOffset) * 4;
        }
      });

      // Replenish — keep 10 alive, spawn away from gator
      const alive = s.particles.filter((p) => p.opacity > 0);
      while (alive.length < 10) {
        const candidate = spawn(s.nextId++);
        // Ensure new items appear on the far side from where gator is headed
        candidate.x = g.dir === 1
          ? MARGIN + Math.random() * (W * 0.5)
          : W * 0.5 + Math.random() * (W * 0.5 - MARGIN);
        alive.push(candidate);
      }
      s.particles = alive;

      // ── Draw ────────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);

      // Subtle dot grid background
      ctx.fillStyle = "#161616";
      for (let gx = 16; gx < W; gx += 32) {
        for (let gy = 16; gy < H; gy += 32) {
          ctx.fillRect(gx, gy, 1, 1);
        }
      }

      // Items
      s.particles.forEach((p) => {
        if (p.opacity <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.opacity);
        drawItem(ctx, p.kind, p.x, p.y, p.scale);
        ctx.restore();
      });

      // Target indicator — faint line from jaw to nearest item
      if (g.targetIdx !== null && s.particles[g.targetIdx]) {
        const t = s.particles[g.targetIdx];
        const jawX = g.dir === 1 ? g.x + GATOR_BODY_W * 0.85 : g.x - GATOR_BODY_W * 0.85;
        ctx.save();
        ctx.globalAlpha = 0.07;
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(jawX, g.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
        ctx.restore();
      }

      // Gator
      drawGator(ctx, g.x, g.y, g.dir, frame, g.mouth > 0.5);

      // Scanlines
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      for (let sy = 0; sy < H; sy += 4) {
        ctx.fillRect(0, sy, W, 2);
      }

      s.animId = requestAnimationFrame(tick);
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
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        imageRendering: "pixelated",
      }}
      aria-hidden="true"
    />
  );
}
