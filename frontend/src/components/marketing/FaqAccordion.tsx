"use client";

import { useState } from "react";
import { MdAdd } from "react-icons/md";

const faq = [
  {
    question: "Preciso ter experiência com violão?",
    answer:
      "Não. A plataforma foi estruturada para receber alunos iniciantes e avançar etapa por etapa.",
  },
  {
    question: "Posso estudar no meu ritmo?",
    answer:
      "Sim. As aulas ficam disponíveis para você retomar quando quiser, sem perder progresso.",
  },
  {
    question: "Tem material complementar?",
    answer:
      "Sim. Cada aula pode incluir arquivos de apoio para reforçar estudo e prática.",
  },
  {
    question: "Quanto custa?",
    answer:
      "O plano gratuito não custa nada e dá acesso às aulas de amostra. O Premium custa R$ 39,90/mês (ou R$ 348/ano) e libera todos os módulos e materiais de apoio.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim. Não exigimos fidelidade — você pode cancelar a assinatura Premium a qualquer momento pela sua área de aluno.",
  },
  {
    question: "Só tem aulas de violão?",
    answer:
      "Por enquanto sim. A Pullse nasceu focada em violão e estamos expandindo a mesma trilha para outros instrumentos; quem já é assinante Premium ganha acesso assim que forem lançados.",
  },
];

/**
 * FaqAccordion — Semantic accordion with smooth CSS grid expansion.
 */
export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="reveal divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {faq.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${index}`}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="focus-visible:ring-accent flex min-h-[52px] w-full items-center justify-between gap-4 py-5 text-left focus-visible:ring-2 focus-visible:outline-none"
              >
                <span className="text-text text-sm font-semibold md:text-base">
                  {item.question}
                </span>
                <MdAdd
                  size={20}
                  className={`shrink-0 text-[#FF6B07] transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={`faq-panel-${index}`}
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="text-text-muted pb-5 text-sm leading-relaxed md:text-base">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
