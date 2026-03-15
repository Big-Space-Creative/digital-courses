import VideoPlayer from "@/components/ui/VideoPlayer";
import LessonTabs from "./LessonTabs";
import {
  MdAccessTime,
  MdArrowDownward,
  MdCheckCircle,
  MdCheckCircleOutline,
} from "react-icons/md";
import Link from "next/link";

export default async function Lesson({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;

  const lesson = {
    id: lessonId,
    title: "Aula 05: Dominando a Pentatônica Menor",
    description: "Aprenda a conectar os 5 shapes da escala pelo braço todo.",
    resumo:
      "Nesta aula fundamental, vamos desmistificar a escala pentatônica menor. Muitas vezes os guitarristas ficam presos no &quot;shape 1&quot;, mas o segredo para a fluência está em visualizar como os 5 desenhos se conectam horizontalmente.",
    aprendizados: [
      "Revisão dos 5 shapes tradicionais (CAGED system).",
      "Como conectar shapes horizontalmente.",
      "Dicas práticas para memorização dos shapes.",
    ],
    dicas:
      "Não tente decorar todos os shapes de uma vez. Foque em conectar o Shape 1 com o Shape 2 primeiro, e só avance quando estiver confortável.",
    videoUrl: "https://www.pexels.com/pt-br/download/video/34258993/",
    duration: "20 min",
    module: {
      id: "2",
      title: "Módulo 2: Técnicas",
      aulas: [
        {
          id: "mod2-aula1",
          title: "Aula 01: Postura correta",
          status: "Concluida",
          duracao: "12 min",
        },
        {
          id: "mod2-aula2",
          title: "Aula 02: Afinação do Instrumento",
          status: "Concluida",
          duracao: "15 min",
        },
        {
          id: "mod2-aula3",
          title: "Aula 03: Primeiras Notas",
          status: "Concluida",
          duracao: "18 min",
        },
        {
          id: "mod2-aula4",
          title: "Aula 04: Ritmo Básico",
          status: "Atual",
          duracao: "16 min",
        },
      ],
    },
    materials: [
      {
        id: "1",
        title: "Cifra da Música de Referência",
        url: "https://www.pexels.com/pt-br/download/video/34258993/",
        type: "image",
        size: "2 MB",
      },
      {
        id: "2",
        title: "Exercícios Práticos",
        url: "https://www.pexels.com/pt-br/download/video/34258993/",
        type: "mp3",
        size: "5 MB",
      },
      {
        id: "3",
        title: "Guia de Técnicas",
        url: "https://www.pexels.com/pt-br/download/video/34258993/",
        type: "image",
        size: "1.5 MB",
      },
    ],
  };

  return (
    <div className="flex w-full flex-col gap-10">
      <div className="relative overflow-hidden rounded-lg">
        <div className="bg-secondary w-2/3 p-6">
          <VideoPlayer
            lessonVideoUrl={
              "https://www.pexels.com/pt-br/download/video/34258993/"
            }
          />
        </div>
        <div className="bg-secondary absolute inset-y-0 right-0 flex min-h-0 w-1/3 flex-col overflow-hidden">
          <div className="bg-[#141B2D] px-6 py-4">
            <h1 className="font-bold text-white">Conteúdo do Curso</h1>
            <p className="text-white/80">Módulo 2: Técnicas e Escalas</p>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-4 [scrollbar-color:#3b82f6_#1e293b] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-blue-500/80 [&::-webkit-scrollbar-thumb]:transition-colors [&::-webkit-scrollbar-thumb]:duration-200 hover:[&::-webkit-scrollbar-thumb]:bg-blue-400 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800/70">
            {lesson.module.aulas.map((aula) => (
              <Link
                href={`/aluno/aula/${aula.id}`}
                key={`${aula.id}`}
                className="group flex cursor-pointer gap-4 rounded-lg p-4 transition-all hover:bg-blue-950"
              >
                <div className="flex size-16 items-center justify-center rounded-lg bg-green-200 text-green-700 transition-all duration-500 group-hover:scale-110">
                  <MdCheckCircle />
                </div>
                <div>
                  <h1 className="text-xs font-bold text-green-700 transition-all duration-500 group-hover:text-green-500">
                    {aula.status}
                  </h1>
                  <p className="text-sm text-white">{aula.title}</p>
                  <span className="text-xs text-white/50">{aula.duracao}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="bg-[#141B2D] px-6 py-4">
            <Link
              href="/aluno/home"
              className="flex w-full items-center justify-center gap-4 rounded-lg bg-gray-700 py-4 font-bold text-white"
            >
              <MdArrowDownward className="size-5 rotate-90" /> Voltar para os
              Módulos
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="border-secondary/20 flex items-start justify-between border-b pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="bg-primary/20 text-primary rounded-sm p-2 text-xs font-bold uppercase">
                Módulo 2: Técnicas
              </p>
              <div className="text-secondary/80 flex items-end gap-1">
                <MdAccessTime className="size-4" />{" "}
                <p className="text-xs">20 min</p>
              </div>
            </div>
            <h1 className="text-secondary text-3xl font-bold">
              Aula 05: Dominando a Pentatônica Menor
            </h1>
            <p className="text-secondary/80 text-base">
              Aprenda a conectar os 5 shapes da escala pelo braço todo.
            </p>
          </div>
          <button className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-500 p-4 font-bold text-white transition-colors duration-300 hover:bg-green-800">
            <MdCheckCircleOutline className="size-6" />
            <p>Marcar como Concluída</p>
          </button>
        </div>
        <div>
          <LessonTabs
            resumo={lesson.resumo}
            aprendizados={lesson.aprendizados}
            dicas={lesson.dicas}
            materials={lesson.materials}
          />
        </div>
      </div>
    </div>
  );
}
