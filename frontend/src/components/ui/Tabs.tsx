"use client";
import { ReactNode, useId, useState } from "react";
export type TabItem = {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
};
export type TabsProps = {
  items: TabItem[];
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};
export function Tabs({
  items,
  label,
  value,
  defaultValue,
  onValueChange,
  className = "",
}: TabsProps) {
  const id = useId();
  const [internal, setInternal] = useState(
    defaultValue ?? items.find((item) => !item.disabled)?.value,
  );
  const selected = value ?? internal;
  function select(next: string) {
    setInternal(next);
    onValueChange?.(next);
  }
  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="ui-tabs">
        {items.map((item, index) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            id={id + "-tab-" + index}
            aria-controls={id + "-panel-" + index}
            aria-selected={selected === item.value}
            tabIndex={selected === item.value ? 0 : -1}
            disabled={item.disabled}
            onClick={() => select(item.value)}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const enabled = items.filter((tab) => !tab.disabled);
              const current = enabled.findIndex(
                (tab) => tab.value === item.value,
              );
              const next =
                event.key === "Home"
                  ? enabled[0]
                  : event.key === "End"
                    ? enabled.at(-1)
                    : enabled[
                        (current +
                          (event.key === "ArrowRight" ? 1 : -1) +
                          enabled.length) %
                          enabled.length
                      ];
              if (next) {
                select(next.value);
                document
                  .getElementById(id + "-tab-" + items.indexOf(next))
                  ?.focus();
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.value}
          role="tabpanel"
          id={id + "-panel-" + index}
          aria-labelledby={id + "-tab-" + index}
          hidden={selected !== item.value}
          tabIndex={0}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
