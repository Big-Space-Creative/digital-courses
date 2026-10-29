import { ComponentPropsWithRef } from "react";
export type ButtonStyleProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
};
export function buttonClassName({
  variant = "primary",
  size = "md",
  className = "",
}: ButtonStyleProps = {}) {
  return `ui-button ui-button--${variant} ui-button--${size} ${className}`;
}
export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClassName({ variant, size, className })}
    >
      {loading && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4 animate-spin motion-reduce:animate-none"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2"
            opacity=".25"
          />
          <path
            d="M12 3a9 9 0 0 1 9 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
      {loading && <span className="sr-only"> — Carregando</span>}
    </button>
  );
}
export default Button;
