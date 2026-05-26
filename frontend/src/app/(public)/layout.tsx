import type { Metadata } from "next";

// Layout compartilhado para todas as páginas públicas (login, register, verify-email, etc.)
// As páginas individuais que são "use client" não podem exportar metadata diretamente,
// então este layout define um baseline que pode ser sobrescrito por páginas server.
export const metadata: Metadata = {
  title: {
    default: "AulasViolão",
    template: "%s — AulasViolão",
  },
  description:
    "Plataforma de cursos de violão online. Aprenda do zero ao avançado com aulas práticas e material de apoio.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
