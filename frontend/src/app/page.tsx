import Link from "next/link";
import {
  MdAutoStories,
  MdGroups,
  MdLibraryMusic,
  MdMusicNote,
  MdOutlineGraphicEq,
  MdOutlinePlayCircle,
  MdOutlineQueryStats,
  MdOutlineTimer,
  MdStar,
} from "react-icons/md";
import { getUserFromToken } from "./actions/user";

const highlights = [
  {
    title: "Aulas que respeitam seu tempo",
    description:
      "Conteudo curto, objetivo e organizado por modulo para voce evoluir sem travar.",
    icon: MdOutlineTimer,
  },
  {
    title: "Trilhas para cada nivel",
    description:
      "Do zero ao avancado com um caminho claro, sem pular fundamentos importantes.",
    icon: MdAutoStories,
  },
  {
    title: "Material de apoio incluso",
    description:
      "PDFs, guias praticos e arquivos complementares em cada aula.",
    icon: MdLibraryMusic,
  },
  {
    title: "Foco em resultado real",
    description:
      "Acompanhe sua progressao e veja sua evolucao em ritmo constante.",
    icon: MdOutlineQueryStats,
  },
];

const journey = [
  {
    step: "01",
    title: "Crie sua conta",
    description: "Cadastre-se em minutos e acesse sua area do aluno.",
  },
  {
    step: "02",
    title: "Escolha o curso destaque",
    description: "O administrador publica os cursos e voce entra direto no que importa.",
  },
  {
    step: "03",
    title: "Estude e pratique",
    description: "Aulas em video + material extra para fixar cada modulo.",
  },
];

const faq = [
  {
    question: "Preciso ter experiencia com violao?",
    answer:
      "Nao. A plataforma foi estruturada para receber alunos iniciantes e avancar etapa por etapa.",
  },
  {
    question: "Posso estudar no meu ritmo?",
    answer:
      "Sim. As aulas ficam disponiveis para voce retomar quando quiser, sem perder progresso.",
  },
  {
    question: "Tem material complementar?",
    answer:
      "Sim. Cada aula pode incluir arquivos de apoio para reforcar estudo e pratica.",
  },
];

export default async function Home() {
  const user = await getUserFromToken();
  const dashboardHref = user?.role === "admin" ? "/admin/dashboard" : "/aluno/home";

  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#fff8f3] via-[#f8f6f5] to-[#fffdfb] text-gray-800">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-6 md:px-8 md:pt-8">
        <header className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-orange-100 text-primary">
              <MdMusicNote size={20} />
            </span>
            <div>
              <p className="text-lg font-semibold leading-none">AulasViolao</p>
              <p className="text-xs text-gray-500">Aprenda sem enrolacao</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {user ? (
              <Link
                href={dashboardHref}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Entrar na plataforma
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-orange-50"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  Criar conta
                </Link>
              </>
            )}
          </nav>
        </header>

        <section className="relative mt-8 overflow-hidden rounded-3xl border border-orange-100 bg-white p-6 md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-orange-100 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-amber-100 blur-3xl" />

          <div className="relative grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <MdOutlineGraphicEq size={16} />
                Plataforma de aprendizado musical
              </p>
              <h1 className="mt-5 text-3xl font-extrabold leading-tight text-secondary md:text-5xl">
                Evolua no violao com uma trilha clara do inicio ao avancado
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">
                Uma experiencia direta, com aulas praticas, organizacao por modulos e
                acompanhamento de progresso para voce tocar com confianca.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={user ? dashboardHref : "/register"}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  <MdOutlinePlayCircle size={18} />
                  Comecar agora
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-xl border border-orange-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-orange-50"
                >
                  Ja tenho conta
                </Link>
              </div>

              <div className="mt-7 flex items-center gap-5">
                <div className="flex items-center gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <MdStar key={index} size={18} />
                  ))}
                </div>
                <p className="text-sm text-gray-600">Metodo aprovado por alunos iniciantes e avancados.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-[#fff7f1] p-5 shadow-sm md:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Aulas objetivas</p>
                  <p className="mt-2 text-2xl font-bold text-secondary">+120</p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Modulos ativos</p>
                  <p className="mt-2 text-2xl font-bold text-secondary">18</p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pratica guiada</p>
                  <p className="mt-2 text-2xl font-bold text-secondary">100%</p>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Suporte didatico</p>
                  <p className="mt-2 text-2xl font-bold text-secondary">Sempre</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-secondary p-4 text-white">
                <p className="text-xs uppercase tracking-wide text-orange-200">Destaque da plataforma</p>
                <p className="mt-1 text-sm leading-relaxed">
                  Curso principal publicado automaticamente para alunos, com atualizacao centralizada pela equipe.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {highlights.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="inline-grid size-10 place-items-center rounded-xl bg-orange-100 text-primary">
                <Icon size={20} />
              </span>
              <h2 className="mt-4 text-lg font-bold text-secondary">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-secondary">Como funciona sua jornada</h2>
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-primary">
              Simples e progressivo
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {journey.map((item) => (
              <article key={item.step} className="rounded-2xl border border-orange-100 bg-[#fffaf6] p-5">
                <p className="text-xs font-bold tracking-widest text-primary">ETAPA {item.step}</p>
                <h3 className="mt-2 text-lg font-semibold text-secondary">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {faq.map((item) => (
            <article key={item.question} className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-secondary">{item.question}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.answer}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl bg-secondary px-6 py-10 text-white md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold md:text-3xl">Pronto para transformar sua pratica musical?</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-200">
                Entre na plataforma e siga uma rotina consistente com aulas, materiais e progresso acompanhavel.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={user ? dashboardHref : "/register"}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                <MdGroups size={18} />
                {user ? "Ir para minha area" : "Criar conta gratis"}
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
