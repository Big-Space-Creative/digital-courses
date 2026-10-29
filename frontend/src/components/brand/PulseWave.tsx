"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The Pullse brand mark — the exact heartbeat waveline path exported from
 * Figma (`new-design/pulllse-04.svg`). Renders two stacked strokes:
 *  - a gradient base that "draws on" via stroke-dashoffset (`.pulse-path`)
 *  - an optional bright "head" that travels the path to read as a live signal
 *
 * The precise path length is measured on mount and fed to CSS as `--pulse-len`
 * so the dash animations are exact regardless of scaling. Reduced-motion is
 * handled in globals.css (draw resolves instantly, head/loop disabled).
 */
const PULSE_PATH =
  "M132.458 364.958C132.458 364.958 208.628 340.657 214.205 353.545C228.399 386.346 209.686 533.295 233.852 533.422C271.344 533.62 284.946 143.13 308.484 191.942C332.023 240.754 290.383 551.906 323.418 531.598C356.453 511.291 369.435 105.711 399.036 138.885C428.638 172.058 365.071 517.16 411.392 522.045C438.671 524.922 458.668 183.636 489.049 205.978C522.843 230.828 467.998 535.825 473.709 515.813C499.286 426.184 532.893 374.662 541.637 363.052C553.935 346.722 614.545 341.326 614.545 341.326";

type PulseWaveProps = {
  className?: string;
  /** Show the traveling "signal head" looping along the line. */
  loop?: boolean;
  /** Accessible label; set to "" for decorative use (aria-hidden). */
  title?: string;
};

/** CSSProperties widened to allow CSS custom properties (--pulse-len). */
type CSSVars = React.CSSProperties & Record<string, string | number>;

export default function PulseWave({
  className,
  loop = true,
  title = "Pullse",
}: PulseWaveProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(2000);

  useEffect(() => {
    if (pathRef.current) {
      setLen(Math.ceil(pathRef.current.getTotalLength()));
    }
  }, []);

  const decorative = title === "";

  return (
    <svg
      viewBox="0 0 749 683"
      fill="none"
      className={className}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative || undefined}
      style={{ "--pulse-len": len } as CSSVars}
    >
      <path
        ref={pathRef}
        d={PULSE_PATH}
        stroke="url(#pulseGrad)"
        strokeWidth={27}
        strokeLinecap="round"
        className="pulse-path"
      />
      {loop && (
        <path
          d={PULSE_PATH}
          stroke="#ffffff"
          strokeWidth={27}
          strokeLinecap="round"
          className="pulse-head"
          style={{ mixBlendMode: "overlay" }}
        />
      )}
      <defs>
        <linearGradient
          id="pulseGrad"
          x1="398.351"
          y1="137.227"
          x2="355.217"
          y2="546.25"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FB7502" />
          <stop offset="1" stopColor="#FF6A07" />
        </linearGradient>
      </defs>
    </svg>
  );
}
