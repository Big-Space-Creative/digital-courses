"use client";
import {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  useId,
  forwardRef,
} from "react";
import { IconType } from "react-icons";
export type FieldProps = {
  id: string;
  label: ReactNode;
  help?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
};
export function Field({
  id,
  label,
  help,
  error,
  children,
  className = "",
}: FieldProps) {
  return (
    <div className={`ui-field ${className}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {help && (
        <p id={id + "-help"} className="ui-help">
          {help}
        </p>
      )}
      {error && (
        <p role="alert" id={id + "-error"} className="ui-error">
          {error}
        </p>
      )}
    </div>
  );
}
type Common = { label: ReactNode; help?: ReactNode; error?: string };
function described(
  id: string,
  help: ReactNode,
  error?: string,
  existing?: string,
) {
  return (
    [existing, help ? id + "-help" : "", error ? id + "-error" : ""]
      .filter(Boolean)
      .join(" ") || undefined
  );
}
export type InputProps = InputHTMLAttributes<HTMLInputElement> &
  Common & { icon?: IconType };
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id: provided, label, help, error, icon: Icon, className = "", ...props },
  ref,
) {
  const generated = useId();
  const id = provided ?? generated;
  return (
    <Field id={id} label={label} help={help} error={error}>
      <div className="ui-input-wrap">
        {Icon && <Icon aria-hidden="true" />}
        <input
          {...props}
          ref={ref}
          id={id}
          className={`ui-control ${className}`}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={described(
            id,
            help,
            error,
            props["aria-describedby"],
          )}
        />
      </div>
    </Field>
  );
});
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  Common;
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { id: provided, label, help, error, className = "", ...props },
    ref,
  ) {
    const generated = useId();
    const id = provided ?? generated;
    return (
      <Field id={id} label={label} help={help} error={error}>
        <textarea
          {...props}
          ref={ref}
          id={id}
          className={`ui-control ${className}`}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={described(
            id,
            help,
            error,
            props["aria-describedby"],
          )}
        />
      </Field>
    );
  },
);
export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & Common;
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { id: provided, label, help, error, className = "", children, ...props },
    ref,
  ) {
    const generated = useId();
    const id = provided ?? generated;
    return (
      <Field id={id} label={label} help={help} error={error}>
        <select
          {...props}
          ref={ref}
          id={id}
          className={`ui-control ${className}`}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={described(
            id,
            help,
            error,
            props["aria-describedby"],
          )}
        >
          {children}
        </select>
      </Field>
    );
  },
);
export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> &
  Common;
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { id: provided, label, help, error, className = "", ...props },
    ref,
  ) {
    const generated = useId();
    const id = provided ?? generated;
    return (
      <div className={`ui-field ${className}`}>
        <label className="ui-checkbox" htmlFor={id}>
          <input
            {...props}
            ref={ref}
            id={id}
            type="checkbox"
            aria-invalid={error ? true : props["aria-invalid"]}
            aria-describedby={described(
              id,
              help,
              error,
              props["aria-describedby"],
            )}
          />
          <span>{label}</span>
        </label>
        {help && (
          <p className="ui-help" id={id + "-help"}>
            {help}
          </p>
        )}
        {error && (
          <p role="alert" className="ui-error" id={id + "-error"}>
            {error}
          </p>
        )}
      </div>
    );
  },
);
