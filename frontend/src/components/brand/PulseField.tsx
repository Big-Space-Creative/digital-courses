"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";

type Pluck = {
  string: number;
  x: number;
  born: number;
  force: number;
  modes: number[];
};

const STRING_COUNT = 6;
const MODES = 4;
const MAX_PLUCKS = 18;
const LIFE_MS = 2600;
const MAX_PIXELS = 4_000_000;
const MAX_SAMPLES = 360;
const STRING_COOLDOWN_MS = 240;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

/**
 * Cordas da Antigravity em uma interpretação suave: quase invisíveis em repouso,
 * com harmônicos amortecidos e pequenos pulsos que viajam a partir do gesto.
 */
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
    const restAlpha = dark ? 0.025 : 0.04;
    const peakAlpha = dark ? 0.46 : 0.44;
    const color = dark ? "255,145,70" : "210,100,32";
    let width = 0;
    let height = 0;
    let ratio = 0;
    let samples = 0;
    let maxDisplacement = 24;
    let frame = 0;
    let resizeFrame = 0;
    let gradient: CanvasGradient;
    let spatialModes = new Float32Array(0);
    let resting = new Float32Array(0);
    let plucks: Pluck[] = [];
    const lastActivationAt = new Array<number>(STRING_COUNT).fill(-Infinity);
    let lastPointer: { x: number; y: number } | null = null;
    let lastMoveAt = -Infinity;
    let lastScrollAt = -Infinity;
    let lastScrollY = window.scrollY;

    const baseline = (string: number) =>
      height * (0.16 + (string / (STRING_COUNT - 1)) * 0.68);

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      if (!samples) return;
      plucks = plucks.filter((pluck) => now - pluck.born < LIFE_MS);
      ctx.strokeStyle = gradient;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let string = 0; string < STRING_COUNT; string++) {
        const harmonics = new Float32Array(MODES);
        const packets: { center: number; amplitude: number }[] = [];
        let energy = 0;
        const frequency = 2 * Math.PI * (1.2 + string * 0.24);

        for (const pluck of plucks) {
          if (pluck.string !== string || now < pluck.born) continue;
          const age = (now - pluck.born) / 1000;
          // Solução analítica: a vibração não depende da taxa de quadros.
          const tail = Math.max(0, 1 - (now - pluck.born) / LIFE_MS);
          const envelope = Math.exp(-age * 2.1) * tail * tail;
          energy += Math.abs(pluck.force) * envelope;
          for (let mode = 0; mode < MODES; mode++) {
            harmonics[mode] +=
              pluck.modes[mode] *
              Math.cos(frequency * (mode + 1) * age) *
              Math.exp(-age * mode * 0.8) *
              envelope;
          }
          const travel = age * 540;
          packets.push(
            {
              center: pluck.x * width - travel,
              amplitude: pluck.force * 0.24 * envelope,
            },
            {
              center: pluck.x * width + travel,
              amplitude: pluck.force * 0.24 * envelope,
            },
          );
        }

        const activity = Math.min(1, energy / 6);
        ctx.globalAlpha = restAlpha + (peakAlpha - restAlpha) * activity;
        ctx.lineWidth = 1.1 - string * 0.09 + activity * 0.9;
        ctx.beginPath();
        for (let point = 0; point <= samples; point++) {
          const x = (point / samples) * width;
          let displacement = 0;
          for (let mode = 0; mode < MODES; mode++) {
            displacement +=
              harmonics[mode] * spatialModes[mode * (samples + 1) + point];
          }
          for (const packet of packets) {
            const distance = x - packet.center;
            if (Math.abs(distance) > 108) continue;
            displacement +=
              packet.amplitude * Math.exp(-((distance / 36) ** 2));
          }
          // Limite suave mesmo sob muitos gestos consecutivos.
          const y =
            baseline(string) +
            resting[string * (samples + 1) + point] +
            Math.tanh(displacement / maxDisplacement) * maxDisplacement;
          if (point === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      frame = 0;
      if (document.hidden || motion.matches) return;
      draw(now);
      if (plucks.length) frame = requestAnimationFrame(tick);
    };

    const pluck = (string: number, x: number, force: number, born: number) => {
      if (motion.matches || document.hidden || !width) return;
      const now = performance.now();
      // O intervalo é por corda e compartilhado por mouse, toque e rolagem.
      // Pulsos do arpejo também reservam o horário futuro sem criar timers.
      if (now - lastActivationAt[string] < STRING_COOLDOWN_MS) return;
      lastActivationAt[string] = Math.max(now, born);
      const position = clamp(x / width, 0.04, 0.96);
      const impulse = clamp(
        force,
        -maxDisplacement * 0.5,
        maxDisplacement * 0.5,
      );
      plucks.push({
        string,
        x: position,
        born,
        force: impulse,
        modes: Array.from(
          { length: MODES },
          (_, mode) =>
            (impulse * Math.sin((mode + 1) * Math.PI * position)) /
            (mode + 1) ** 1.5,
        ),
      });
      if (plucks.length > MAX_PLUCKS) plucks.shift();
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, bounds.width);
      const nextHeight = Math.max(1, bounds.height);
      const nextRatio = Math.min(
        window.devicePixelRatio || 1,
        2,
        Math.sqrt(MAX_PIXELS / (nextWidth * nextHeight)),
      );
      if (width === nextWidth && height === nextHeight && ratio === nextRatio)
        return;
      width = nextWidth;
      height = nextHeight;
      ratio = nextRatio;
      maxDisplacement = width < 640 ? 14 : 24;
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

      samples = Math.min(MAX_SAMPLES, Math.max(2, Math.ceil(width / 6)));
      spatialModes = new Float32Array(MODES * (samples + 1));
      resting = new Float32Array(STRING_COUNT * (samples + 1));
      for (let point = 0; point <= samples; point++) {
        const u = point / samples;
        for (let mode = 0; mode < MODES; mode++) {
          spatialModes[mode * (samples + 1) + point] = Math.sin(
            (mode + 1) * Math.PI * u,
          );
        }
        for (let string = 0; string < STRING_COUNT; string++) {
          resting[string * (samples + 1) + point] =
            Math.sin(u * Math.PI * 3 + string * 0.8) * 0.2;
        }
      }
      gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, `rgba(${color},0.15)`);
      gradient.addColorStop(0.2, `rgba(${color},0.8)`);
      gradient.addColorStop(0.5, `rgba(${color},1)`);
      gradient.addColorStop(0.8, `rgba(${color},0.8)`);
      gradient.addColorStop(1, `rgba(${color},0.15)`);
      if (!document.hidden) draw(performance.now());
    };

    const onResize = () => {
      if (document.hidden || resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        resize();
      });
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const current = { x: event.clientX, y: event.clientY };
      const previous = lastPointer;
      if (!previous) {
        lastPointer = current;
        return;
      }
      const distance = Math.hypot(
        current.x - previous.x,
        current.y - previous.y,
      );
      const now = performance.now();
      if (distance < 2 || now - lastMoveAt < 70) return;
      lastPointer = current;
      lastMoveAt = now;
      for (let string = 0; string < STRING_COUNT; string++) {
        const y = baseline(string);
        const crossed = (previous.y - y) * (current.y - y) <= 0;
        if (crossed || Math.abs(current.y - y) < 14) {
          pluck(
            string,
            current.x,
            (current.y >= previous.y ? 1 : -1) *
              Math.min(12, 4 + distance * 0.055),
            now,
          );
        }
      }
    };
    const onDown = (event: PointerEvent) => {
      const now = performance.now();
      lastPointer = { x: event.clientX, y: event.clientY };
      const nearest = Math.round(
        clamp(
          ((event.clientY / height - 0.16) / 0.68) * (STRING_COUNT - 1),
          0,
          STRING_COUNT - 1,
        ),
      );
      for (let string = 0; string < STRING_COUNT; string++) {
        const distance = Math.abs(event.clientY - baseline(string));
        const coupling = Math.exp(
          -((distance / Math.max(64, height * 0.15)) ** 2),
        );
        if (string === nearest || coupling > 0.15) {
          pluck(string, event.clientX, 6 * Math.max(coupling, 0.3), now);
        }
      }
    };
    const onScroll = () => {
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      const now = performance.now();
      if (Math.abs(delta) < 2 || now - lastScrollAt < 170) return;
      lastScrollAt = now;
      const force =
        Math.sign(delta) * Math.min(4, 1.5 + Math.abs(delta) * 0.025);
      for (let string = 0; string < STRING_COUNT; string++) {
        // Datas futuras criam o arpejo sem timers para limpar no unmount.
        pluck(string, width * (0.4 + string * 0.04), force, now + string * 24);
      }
    };
    const resetPointer = () => {
      lastPointer = null;
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      frame = resizeFrame = 0;
      plucks = [];
      lastActivationAt.fill(-Infinity);
      lastPointer = null;
      lastScrollY = window.scrollY;
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
    window.addEventListener("pointercancel", resetPointer, { passive: true });
    document.addEventListener("pointerleave", resetPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    viewport?.addEventListener("resize", onResize, { passive: true });
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      reset();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointercancel", resetPointer);
      document.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      viewport?.removeEventListener("resize", onResize);
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  );
}
