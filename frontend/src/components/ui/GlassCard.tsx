import { HTMLAttributes, ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  /** Legacy tone alias, retained while callers migrate to semantic panels. */
  tone?: "plain" | "accent";
  /** Legacy surface tier; both tiers now use an opaque panel. */
  strong?: boolean;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Compatibility panel. Opaque semantic surface with a subtle border and shadow.
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
