"use client";
import { ReactNode } from "react";
export type DataListColumn<T> = {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
};
export type DataListAction<T> = {
  label: string;
  onClick: (item: T) => void;
  disabled?: (item: T) => boolean;
  danger?: boolean;
};
export type DataListProps<T> = {
  items: T[];
  columns: DataListColumn<T>[];
  getKey: (item: T) => string | number;
  getItemLabel?: (item: T) => string;
  label: string;
  actions?: DataListAction<T>[];
  empty?: ReactNode;
  className?: string;
};
export function DataList<T>({
  items,
  columns,
  getKey,
  getItemLabel,
  label,
  actions,
  empty,
  className = "",
}: DataListProps<T>) {
  if (!items.length)
    return (
      <>{empty ?? <p className="ui-state">Nenhum resultado encontrado.</p>}</>
    );
  return (
    <div className={`ui-data-list ${className}`}>
      <table role="table">
        <caption className="sr-only">{label}</caption>
        <thead role="rowgroup">
          <tr role="row">
            {columns.map((column) => (
              <th key={column.key} scope="col" role="columnheader">
                {column.label}
              </th>
            ))}
            {actions?.length ? (
              <th scope="col" role="columnheader">
                Ações
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {items.map((item) => (
            <tr key={getKey(item)} role="row">
              {columns.map((column) => (
                <td key={column.key} data-label={column.label} role="cell">
                  <span>{column.render(item)}</span>
                </td>
              ))}
              {actions?.length ? (
                <td data-label="Ações" role="cell">
                  <details
                    className="ui-actions-menu"
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.preventDefault();
                        event.currentTarget.open = false;
                        event.currentTarget.querySelector("summary")?.focus();
                      }
                    }}
                  >
                    <summary
                      aria-label={`Abrir ações: ${getItemLabel?.(item) ?? getKey(item)}`}
                    >
                      Ações <span aria-hidden="true">...</span>
                    </summary>
                    <div>
                      {actions.map((action) => (
                        <button
                          type="button"
                          key={action.label}
                          disabled={action.disabled?.(item)}
                          className={action.danger ? "ui-error" : ""}
                          onClick={(event) => {
                            const details =
                              event.currentTarget.closest("details");
                            details?.removeAttribute("open");
                            details?.querySelector("summary")?.focus();
                            action.onClick(item);
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </details>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
