import { ReactNode } from "react";
export type EmptyStateProps = {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};
export function EmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`ui-state ${className}`}>
      {icon && <div aria-hidden="true">{icon}</div>}
      <h2>{title}</h2>
      {description && <p className="ui-help">{description}</p>}
      {action}
    </div>
  );
}
