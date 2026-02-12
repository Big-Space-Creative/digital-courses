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
      <div className="flex w-full flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{label}</label>

          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>

        <div
          className={`group focus-within:ring-primary flex items-center gap-2 rounded-lg border p-2.5 transition-all duration-300 focus-within:border-transparent focus-within:ring-2 ${error ? "border-red-500 ring-red-200" : "border-gray-500/50"} ${className}`}
        >
          {Icon && (
            <Icon
              className={`size-6 transition-colors ${
                error
                  ? "text-red-500"
                  : "group-focus-within:text-primary text-gray-500/50"
              }`}
            />
          )}

          <input
            ref={ref}
            className="w-full bg-transparent text-sm outline-none"
            {...props}
          />
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";
