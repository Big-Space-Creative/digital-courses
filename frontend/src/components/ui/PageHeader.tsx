import { ReactNode } from "react";
export type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
};
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`ui-page-header ${className}`}>
      <div>
        {eyebrow && <div className="ui-help">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p className="ui-help">{description}</p>}
      </div>
      {actions && <div className="ui-page-actions">{actions}</div>}
    </header>
  );
}
