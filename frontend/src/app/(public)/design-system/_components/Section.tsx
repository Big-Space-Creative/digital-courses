"use client";

import { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

type SectionProps = {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
};

/** Bloco de documentação: título, texto de apoio e exemplos reais dos componentes. */
export default function Section({
  id,
  title,
  description,
  children,
}: SectionProps) {
  const ref = useReveal<HTMLElement>();

  return (
    <section
      id={id}
      ref={ref}
      className="reveal mx-auto flex max-w-5xl scroll-mt-8 flex-col gap-6 px-6 pb-20"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-[length:var(--text-h2)] leading-tight font-semibold text-balance">
          {title}
        </h2>
        {description && (
          <p className="text-text-muted max-w-[60ch] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
