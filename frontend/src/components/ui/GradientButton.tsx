"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type GradientButtonProps = {
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Primary CTA in the pulse gradient with a slow animated sweep
 * (`.gradient-animate`) and a compositor-only hover lift. Focus ring is
 * always visible for keyboard users. Reduced-motion disables the sweep via
 * globals.css.
 */
export default function GradientButton({
  children,
  className = "",
  ...rest
}: GradientButtonProps) {
  const classes = [
    "gradient-animate",
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3",
    "font-medium text-white shadow-lg",
    "transition-transform duration-150 ease-out",
    "hover:-translate-y-0.5 active:translate-y-0",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:ring-[#ff6b07] disabled:opacity-60 disabled:pointer-events-none",
    className,
  ].join(" ");

  return (
    <button
      className={classes}
      style={{ backgroundImage: "var(--gradient-pulse)" }}
      {...rest}
    >
      {children}
    </button>
  );
}
