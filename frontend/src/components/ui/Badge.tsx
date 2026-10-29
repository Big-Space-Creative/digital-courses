import { HTMLAttributes } from "react";
export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "neutral" | "success" | "warning" | "danger" | "accent";
};
export function Badge({
  variant = "neutral",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span {...props} className={`ui-badge ui-badge--${variant} ${className}`} />
  );
}
export { Badge as StatusPill };
