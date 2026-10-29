"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";

type Pulse = { x: number; born: number; force: number };

const STRING_COUNT = 6;
const LIFE_MS = 2200;
const MAX_PULSES = 7;
const MAX_SAMPLES = 420;
const MAX_PIXELS = 4_000_000;
const PACKET_WIDTH = 125;
const STRING_PHASES = Array.from({ length: STRING_COUNT }, (_, i) => ({
  sin: Math.sin(i * 0.28),
  cos: Math.cos(i * 0.28),
}));

/** Seis cordas desenham a onda da Pullse e respondem a mouse, toque e rolagem. */
export default function PulseField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const viewport = window.visualViewport;
    const dark = theme === "dark";
    let width = 0;
    let height = 0;
    let ratio = 0;
    let frame = 0;
    let resizeFrame = 0;
    let samples = 0;
    let gradient: CanvasGradient;
    let resting: Float32Array[] = [];
    let packetSin = new Float32Array(0);
    let packetCos = new Float32Array(0);
    let pulses: Pulse[] = [];
    let lastPointerAt = -Infinity;
    let lastScrollAt = -Infinity;
    let previousX = -1000;
    let previousY = -1000;
    let previousScrollY = window.scrollY;

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      if (!width || !height) return;
      pulses = pulses.filter((pulse) => now - pulse.born < LIFE_MS);
      packetSin.fill(0);
      packetCos.fill(0);

      // A perturbação é calculada uma vez e compartilhada pelas seis cordas.
      // A forma em repouso e o gradiente só são reconstruídos no resize.
      const step = width / samples;
      for (const pulse of pulses) {
        const age = now - pulse.born;
        const decay = (1 - age / LIFE_MS) ** 2 * pulse.force;
        const travel = age * 0.52;
        for (let point = 0; point <= samples; point++) {
          const distance = Math.abs(point * step - pulse.x * width) - travel;
          if (Math.abs(distance) > PACKET_WIDTH * 3) continue;
          const envelope = Math.exp(-((distance / PACKET_WIDTH) ** 2)) * decay;
          packetSin[point] += Math.sin(distance * 0.037) * envelope;
          packetCos[point] += Math.cos(distance * 0.037) * envelope;
        }
      }

      ctx.strokeStyle = gradient;
      for (let string = 0; string < STRING_COUNT; string++) {
        const phase = STRING_PHASES[string];
        ctx.beginPath();
        for (let point = 0; point <= samples; point++) {
          const displacement =
            packetSin[point] * phase.cos - packetCos[point] * phase.sin;
          const y =
            resting[string][point] + Math.max(-80, Math.min(80, displacement));
          const x = point * step;
          if (point === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineWidth = string === 2 ? 1.8 : 0.9;
        ctx.stroke();
      }
    };

    const tick = (now: number) => {
      frame = 0;
      if (document.hidden || motion.matches) return;
      draw(now);
      if (pulses.length) frame = requestAnimationFrame(tick);
    };

    const pluck = (x: number, y: number, force: number) => {
      if (motion.matches || document.hidden || !width || !height) return;
      const coupling =
        0.35 + 0.65 * Math.exp(-(((y - height * 0.62) / (height * 0.65)) ** 2));
      pulses.push({
        x: Math.max(0, Math.min(1, x / width)),
        born: performance.now(),
        force: Math.min(72, force) * coupling,
      });
      if (pulses.length > MAX_PULSES) pulses.shift();
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, bounds.width);
      const nextHeight = Math.max(1, bounds.height);
      // Limita também a memória de telas grandes, além do DPR de celulares.
      const nextRatio = Math.min(
        window.devicePixelRatio || 1,
        2,
        Math.sqrt(MAX_PIXELS / (nextWidth * nextHeight)),
      );
      if (width === nextWidth && height === nextHeight && ratio === nextRatio) {
        return;
      }
      width = nextWidth;
      height = nextHeight;
      ratio = nextRatio;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      ctx.setTransform(
        canvas.width / width,
        0,
        0,
        canvas.height / height,
        0,
        0,
      );

      samples = Math.min(MAX_SAMPLES, Math.max(2, Math.ceil(width / 5)));
      packetSin = new Float32Array(samples + 1);
      packetCos = new Float32Array(samples + 1);
      const amplitude = Math.min(height * 0.2, width * 0.28, 155);
      const gap = Math.min(13, Math.max(8, width * 0.027));
      resting = Array.from({ length: STRING_COUNT }, (_, string) => {
        const points = new Float32Array(samples + 1);
        for (let point = 0; point <= samples; point++) {
          const u = point / samples;
          const envelope = Math.exp(-(((u - 0.72) / 0.22) ** 2));
          points[point] =
            height * 0.62 +
            (string - 2.5) * gap +
            Math.sin((u - 0.5) * 21 + string * 0.15) * envelope * amplitude;
        }
        return points;
      });
      gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "rgba(255,107,7,0)");
      gradient.addColorStop(0.22, `rgba(255,107,7,${dark ? 0.15 : 0.13})`);
      gradient.addColorStop(0.66, `rgba(255,107,7,${dark ? 0.52 : 0.4})`);
      gradient.addColorStop(1, "rgba(255,107,7,0)");
      if (!document.hidden) draw(performance.now());
    };

    const onResize = () => {
      if (resizeFrame || document.hidden) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        resize();
      });
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const now = performance.now();
      if (
        now - lastPointerAt < 90 ||
        Math.hypot(event.clientX - previousX, event.clientY - previousY) < 28
      ) {
        return;
      }
      lastPointerAt = now;
      previousX = event.clientX;
      previousY = event.clientY;
      pluck(event.clientX, event.clientY, 34);
    };
    const onDown = (event: PointerEvent) => {
      pluck(event.clientX, event.clientY, 72);
    };
    const onScroll = () => {
      const delta = Math.abs(window.scrollY - previousScrollY);
      previousScrollY = window.scrollY;
      const now = performance.now();
      if (delta < 2 || now - lastScrollAt < 190) return;
      lastScrollAt = now;
      pluck(width * 0.72, height * 0.62, 44);
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      frame = 0;
      resizeFrame = 0;
      pulses = [];
      previousX = previousY = -1000;
      previousScrollY = window.scrollY;
    };
    const onMotion = () => {
      reset();
      if (!document.hidden) draw(performance.now());
    };
    const onVisibility = () => {
      reset();
      if (!document.hidden) {
        resize();
        draw(performance.now());
      }
    };

    resize();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    viewport?.addEventListener("resize", onResize, { passive: true });
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      reset();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      viewport?.removeEventListener("resize", onResize);
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [theme]);

  // Mantém o canvas antes das seções e sem z-index negativo: os painéis opacos
  // cobrem a onda, enquanto os intervalos deixam a assinatura da marca aparecer.
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  );
}
