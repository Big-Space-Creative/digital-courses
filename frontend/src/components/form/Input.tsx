import { forwardRef, InputHTMLAttributes } from "react";
import { IconType } from "react-icons";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: IconType;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, className, ...props }, ref) => {
    return (
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-ink/80 text-sm font-medium">{label}</label>

          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>

        <div
          className={`group focus-within:ring-accent bg-surface-soft rounded-bento-md flex items-center gap-2 border p-3 transition-all duration-150 focus-within:border-transparent focus-within:ring-2 ${error ? "border-red-500 ring-1 ring-red-200" : "border-ink/12"} ${className ?? ""}`}
        >
          {Icon && (
            <Icon
              className={`size-5 shrink-0 transition-colors ${
                error
                  ? "text-red-500"
                  : "group-focus-within:text-accent text-ink/40"
              }`}
            />
          )}

          <input
            ref={ref}
            className="text-ink placeholder:text-ink/70 w-full bg-transparent text-sm outline-none"
            {...props}
          />
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";
