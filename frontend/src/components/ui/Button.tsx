"use client";
import { ComponentPropsWithRef } from "react";
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
      className={`ui-button ui-button--${variant} ui-button--${size} ${className}`}
    >
      {loading && <span aria-hidden="true">...</span>}
      {children}
      {loading && <span className="sr-only"> — Carregando</span>}
    </button>
  );
}
export default Button;
