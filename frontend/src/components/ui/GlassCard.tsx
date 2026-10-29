import { HTMLAttributes, ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  /** "accent" tints the glass with the pulse gradient for featured surfaces. */
  tone?: "plain" | "accent";
  /** Use the stronger blur tier (foreground modals / banners). */
  strong?: boolean;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Translucent surface (glassmorphism). Reads correctly only over a busy /
 * gradient / image backdrop — see DESIGN.md §4. Hover lift + focus handling
 * come from the `.glass` utility in globals.css.
 */
export default function GlassCard({
  children,
  tone = "plain",
  strong = false,
  className = "",
  ...rest
}: GlassCardProps) {
  const classes = [
    "glass",
    strong ? "glass-strong" : "",
    tone === "accent" ? "glass-accent" : "",
    "p-6",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
