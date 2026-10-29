"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";

type Wavefront = {
  x: number;
  y: number;
  birth: number;
  maxLife: number;
  /** Lobe count for the star/blob distortion — see `distortedRadius`. */
  arms: number;
  /** Phase offset so concurrent wavefronts don't share the same lobes. */
  seed: number;
};

// Must match the `.pulse-grid` background-size in globals.css — the canvas
// glow dots are drawn at the same grid coordinates as the static CSS dot
// texture so a passing wave reads as "the grid lighting up", not a
// separate layer floating over it.
const CELL_SIZE = 44;

const WAVE_SPEED = 1.05; // px per ms

// Ring thickness (gaussian sigma, px) breathes over the wave's lifetime
// instead of staying constant — thin at birth (right at the cursor), widest
// at half life, thin again as it nears the far edge of the screen, where it
// fades out alongside the shrinking `fade` alpha. See `bandWidthAt`.
const BAND_WIDTH_MIN = 12;
const BAND_WIDTH_MAX = 64;

// Spawning is gated by grid-cell transitions, not distance/time (see
// handlePointerMove) — this cap is what bounds per-frame cost when the
// pointer sweeps across many cells in a row (oldest wavefront is evicted
// immediately past the cap) while still allowing several waves to overlap.
const MAX_WAVEFRONTS = 16;
const DOT_BASE_RADIUS = 1;
const DOT_MAX_RADIUS = 2.2;
const MAX_ALPHA = 0.42;
const AMPLITUDE_EPSILON = 0.03;

// Star/blob distortion (see traceRing below): the ring radius is perturbed
// by a sine wave in angle, giving rounded-tip points instead of a perfect
// circle. Arms vary per wavefront so concurrent ripples don't look cloned.
const STAR_WOBBLE = 34; // px, lobe depth
const STAR_ARMS_MIN = 3;
const STAR_ARMS_SPAN = 4; // arms ∈ [MIN, MIN + SPAN)

// Ring is walked by arc length (not iterated over the whole grid), so cost
// scales with the ring's circumference, never with total screen area —
// this is what keeps a viewport-spanning wave cheap at any radius.
const STEP_ARC_LENGTH = 24; // px between angular ring samples
const MIN_STEPS = 24;
const MAX_STEPS = 420;
const SNAP_SIGMA = CELL_SIZE * 0.5; // how sharply amplitude falls off between grid nodes

// Radial echo: each angular sample also fans out a few steps inward/outward
// so the ring has a soft glow width instead of being a 1px wire outline.
// Fixed small fan (not a full-grid Gaussian scan) keeps this bounded — see
// traceRing. Offsets are expressed as sigma multiples, scaled by the
// current (age-dependent) band width at draw time, not a fixed px amount —
// `weight` only depends on the multiple, not on how wide the band currently
// is, so it's precomputed once here instead of every frame.
const RADIAL_SAMPLES = [-1.1, -0.55, 0, 0.55, 1.1].map((factor) => ({
  factor,
  weight: Math.exp(-(factor * factor) / 2),
}));

// Same accent stops as --gradient-pulse / PulseWave's SVG gradient (see
// DESIGN.md) — a wavefront reads as the brand orange sweeping through the
// grid, not a separate motif.
const ACCENT_500 = [251, 117, 2] as const; // #FB7502, resting/low-amplitude
const ACCENT_400 = [255, 106, 7] as const; // #FF6A07, peak amplitude

// Dark canvas needs a brighter peak to read against --color-surface the way
// the light-theme accent does — mirrors PulseWave's brighter dark-theme head.
const DARK_CORE = [255, 154, 92] as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixColor(
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  t: number,
): [number, number, number] {
  return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)];
}

/**
 * The Pullse brand mark's full-background counterpart: the mouse doesn't
 * drag a local trail, it drops a stone in a pond — one stone per pond cell.
 * A wavefront spawns at the cursor the moment it crosses into a different
 * `CELL_SIZE` grid cell than the one it last spawned from (see
 * `handlePointerMove`), so lingering inside a cell fires once, not on every
 * `pointermove` tick; re-entering a cell later fires again. The wavefront
 * itself is not a perfect circle, it's a rounded-point star
 * (`distortedRadius`) so it reads as a signal, not a ripple decal — that
 * propagates edge to edge. `maxLife` is derived from the viewport diagonal
 * at spawn time, which guarantees the ring finishes crossing the entire
 * screen before fading regardless of viewport size.
 *
 * Each wavefront is walked by arc length (`traceRing`), fanning a handful of
 * radial samples (`RADIAL_SAMPLES`) out from each angular step to give the
 * ring a soft glow width instead of a 1px wire outline — that width itself
 * breathes over the wave's life (thin → thick → thin, see `bandWidth`) —
 * then snapped onto the same fixed grid the static texture uses. Cost scales
 * with the ring's circumference (capped at `MAX_STEPS` × the fixed fan size), not the
 * screen's area — testing every grid cell against every wavefront every
 * frame was the actual performance cost of the previous version, and it's
 * what keeps this cheap even as the ring grows to fill the viewport.
 * Overlapping wavefronts are drawn with `globalCompositeOperation:
 * "lighter"` so intersections brighten additively instead of alpha-stacking.
 *
 * Two layers, both `position: fixed` so they share one coordinate space
 * that doesn't drift under scroll:
 *  - a static CSS dot-grid (`.pulse-grid`, globals.css) — the "always on"
 *    half of "the whole background is dynamic": a faint technical texture
 *    that costs nothing to render and needs no JS.
 *  - this canvas, transparent, drawing only the grid nodes a ring is
 *    currently passing through — idle cost is zero.
 *
 * Stacking: canvas mounts before every section in the DOM and is
 * `position: fixed` with z-index:auto. Per CSS painting-order rules, a
 * positioned z-index:auto box only paints above earlier positioned siblings
 * in tree order — every section already carries `relative` (see
 * HeroSection/HighlightsSection/etc.), which is what lets their opaque
 * backgrounds and bento tiles occlude the canvas correctly. Don't remove
 * `relative` from a section without checking this, and never give either
 * layer a negative z-index — that pushes it behind `<main>`'s own
 * background instead.
 */
export default function PulseField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const coreColor = theme === "dark" ? DARK_CORE : ACCENT_400;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // The squares (`CELL_SIZE`) are a fixed 44px, always — that part never
    // needed fixing. What DOES need to track the viewport is the canvas's
    // *coverage area* (backing-store resolution + `cols`/`rows`): a canvas
    // sized once at mount and never touched again stays a fixed rectangle
    // pinned to the top-left, and its CSS box (`fixed inset-0`, always
    // 100% of the viewport) stretches that fixed-resolution rectangle to
    // fill however much bigger the real viewport is — which is what read
    // as "capped size" with visible stretching/staleness at the old edge.
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cols = 0;
    let rows = 0;
    // `draw` (defined further down) is wired in via this indirection —
    // `resize` needs to call it, but also needs to run once *before* `draw`
    // is declared, so a direct reference would hit the temporal dead zone.
    let redraw: () => void = () => {};
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(window.innerWidth / CELL_SIZE) + 1;
      rows = Math.ceil(window.innerHeight / CELL_SIZE) + 1;
      // Reassigning canvas.width/height (above) silently wipes the pixel
      // buffer — redraw immediately so a resize landing while the loop is
      // idle never leaves a stale frame on screen until the next mouse move.
      redraw();
    };
    resize();

    // visualViewport's resize event catches browser/OS zoom changes that
    // the plain window resize event can miss in some browsers. (A
    // ResizeObserver on <html> was tried here too — it fires on any page
    // content/height change, not just viewport/zoom, and each firing's
    // canvas.width reassignment was expensive enough to read as the page
    // freezing. Gone for good; these two events are the correct, narrowly
    // scoped signal.)
    window.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("resize", resize);

    let wavefronts: Wavefront[] = [];
    // Grid cell the pointer last spawned a wavefront from — spawning is
    // gated by crossing into a *different* cell, not by distance or time,
    // so lingering inside one cell fires once, and only moving to another
    // cell (any cell, including one already visited) fires again.
    let lastCellKey: number | null = null;
    let frame = 0;

    // Snapped-cell dedupe per wavefront per frame — the arc-length step is
    // finer than the grid spacing (so the ring never shows gaps), which
    // means neighboring samples routinely round to the same grid node.
    // Without this, "lighter" compositing would draw and re-blend that
    // node several times a frame for no visual gain.
    const touched = new Set<number>();

    const traceRing = (w: Wavefront, now: number) => {
      const age = now - w.birth;
      const baseRadius = age * WAVE_SPEED;
      const t = age / w.maxLife; // 0 at spawn, 1 at natural death
      const fade = Math.max(0, 1 - t);
      if (fade <= 0) return;

      // Thin → thick → thin: the sin() term peaks at t=0.5 and bottoms out
      // (not at zero, at BAND_WIDTH_MIN) at both t=0 and t=1. Width and
      // alpha fade independently on purpose — a literal zero-width band
      // right at t=1 would extinguish the ring a beat before `fade` does,
      // reading as a pop instead of a dissolve.
      const bandWidth =
        BAND_WIDTH_MIN + (BAND_WIDTH_MAX - BAND_WIDTH_MIN) * Math.sin(Math.PI * t);

      const circumference = 2 * Math.PI * Math.max(baseRadius, 1);
      const steps = Math.min(
        MAX_STEPS,
        Math.max(MIN_STEPS, Math.ceil(circumference / STEP_ARC_LENGTH)),
      );

      touched.clear();

      for (let i = 0; i < steps; i += 1) {
        const angle = (i / steps) * Math.PI * 2;
        // Rounded-point star, not a circle: the sine term bulges `arms`
        // lobes out of the ring so some sides read pointier than others.
        const distortedRadius = baseRadius + STAR_WOBBLE * Math.sin(angle * w.arms + w.seed);
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        for (const sample of RADIAL_SAMPLES) {
          const r = distortedRadius + sample.factor * bandWidth;
          if (r <= 0) continue;

          const x = w.x + cosA * r;
          const y = w.y + sinA * r;
          const gx = Math.round(x / CELL_SIZE);
          const gy = Math.round(y / CELL_SIZE);
          if (gx < 0 || gx > cols || gy < 0 || gy > rows) continue;

          const key = gy * (cols + 1) + gx;
          if (touched.has(key)) continue;
          touched.add(key);

          const px = gx * CELL_SIZE;
          const py = gy * CELL_SIZE;
          const snapDist = Math.hypot(px - x, py - y);
          const snapFalloff = Math.exp(-(snapDist * snapDist) / (2 * SNAP_SIGMA * SNAP_SIGMA));
          const amplitude = snapFalloff * sample.weight * fade;
          if (amplitude < AMPLITUDE_EPSILON) continue;

          const [r255, g255, b255] = mixColor(ACCENT_500, coreColor, amplitude);
          const dotRadius = DOT_BASE_RADIUS + (DOT_MAX_RADIUS - DOT_BASE_RADIUS) * amplitude;

          ctx.beginPath();
          ctx.fillStyle = `rgba(${r255}, ${g255}, ${b255}, ${amplitude * MAX_ALPHA})`;
          ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const draw = () => {
      const now = performance.now();
      wavefronts = wavefronts.filter((w) => now - w.birth < w.maxLife);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (wavefronts.length > 0) {
        ctx.globalCompositeOperation = "lighter";
        for (const w of wavefronts) traceRing(w, now);
        ctx.globalCompositeOperation = "source-over";
      }

      if (wavefronts.length > 0) {
        frame = requestAnimationFrame(draw);
      } else {
        frame = 0;
      }
    };
    redraw = draw;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      const gx = Math.floor(event.clientX / CELL_SIZE);
      const gy = Math.floor(event.clientY / CELL_SIZE);
      const cellKey = gy * (cols + 1) + gx;
      if (cellKey === lastCellKey) return;
      lastCellKey = cellKey;

      const now = performance.now();
      // Read live, not captured once — a wave spawned after a resize should
      // still be guaranteed to reach the current far edge, not a stale one.
      const diagonal = Math.hypot(window.innerWidth, window.innerHeight);
      wavefronts.push({
        x: event.clientX,
        y: event.clientY,
        birth: now,
        maxLife: (diagonal / WAVE_SPEED) * 1.1,
        arms: STAR_ARMS_MIN + Math.floor(Math.random() * STAR_ARMS_SPAN),
        seed: Math.random() * Math.PI * 2,
      });
      if (wavefronts.length > MAX_WAVEFRONTS) wavefronts.shift();
      if (!frame) frame = requestAnimationFrame(draw);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => {
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [coreColor]);

  return (
    <>
      <div
        aria-hidden="true"
        className="pulse-grid pointer-events-none fixed inset-0"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
      />
    </>
  );
}
