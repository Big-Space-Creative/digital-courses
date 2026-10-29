import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { MdFormatQuote, MdStar } from "react-icons/md";
import PulseWave from "@/components/brand/PulseWave";
import ThemeProvider from "@/components/marketing/ThemeProvider";
import ThemeToggle from "@/components/marketing/ThemeToggle";

type AuthLayoutProps = {
  children: ReactNode;
};

/**
 * Shared chrome for /login and /register: brand header + light/dark toggle
 * (scoped here via ThemeProvider, same as the home page — never touches
 * /admin or /aluno, which stay light-only) and a testimonial panel reusing
 * TestimonialsSection's featured quote and HeroSection's photo verbatim,
 * rather than the placeholder photo/quote the old design shipped with.
 * `children` renders the page-specific heading + form.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <ThemeProvider>
      <div className="bg-surface flex min-h-dvh">
        <div className="flex flex-1 flex-col px-5 py-6 md:px-10 lg:px-16">
          <header className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <PulseWave className="pulse-glow h-8 w-8" title="" />
              <span className="text-ink text-lg font-semibold tracking-tight">
                Pullse
              </span>
            </Link>
            <ThemeToggle />
          </header>

          <div className="flex flex-1 flex-col justify-center gap-8 py-10 md:mx-auto md:w-full md:max-w-md">
            {children}
          </div>
        </div>

        <div className="rounded-bento-xl bg-ink relative m-3 hidden overflow-hidden md:m-4 md:flex md:flex-1">
          <Image
            src="/02.jpg"
            alt="Aluno tocando guitarra elétrica ao vivo, sorrindo"
            fill
            sizes="40vw"
            className="object-cover opacity-70"
            style={{ objectPosition: "32% 38%" }}
          />
          <div className="from-ink via-ink/50 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="relative z-10 flex flex-1 flex-col justify-end p-8 md:p-10">
            <MdFormatQuote
              size={32}
              className="text-surface/40"
              aria-hidden="true"
            />
            <div className="mt-4 flex items-center gap-1 text-white">
              {Array.from({ length: 5 }).map((_, index) => (
                <MdStar key={index} size={16} />
              ))}
            </div>
            <p className="text-surface mt-3 text-lg leading-relaxed">
              &quot;Eu tentei aprender sozinha por anos e sempre travava no
              mesmo ponto. Aqui os módulos me levaram do zero até tocar minhas
              músicas favoritas sem pular etapa nenhuma.&quot;
            </p>
            <p className="text-surface/60 mt-5 text-sm">
              <span className="text-surface font-semibold">
                Mariana Duarte
              </span>
              {" · "}
              29 anos, aluna há 8 meses
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
