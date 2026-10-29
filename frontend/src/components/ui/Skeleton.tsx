import { HTMLAttributes } from "react";
/** Mark the parent region aria-busy while its real content is loading. */
export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} aria-hidden="true" className={`ui-skeleton ${className}`} />
  );
}
