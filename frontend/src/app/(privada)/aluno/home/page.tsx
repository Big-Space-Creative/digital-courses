"use client";
import ProgressBar from "@/components/ui/ProgressBar";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  MdArrowBackIos,
  MdCheckCircle,
  MdLock,
  MdOutlinePlayCircleFilled,
  MdPlayArrow,
} from "react-icons/md";

export default function Home() {
  const user = {
    name: "João Silva",
  };

  const Curso = {
    Title: "Curso Completo de Violão para Iniciantes",
    Description:
      "Aprenda a tocar violão do zero com nosso curso completo para iniciantes. Com aulas passo a passo, você vai dominar acordes, ritmos e técnicas para tocar suas músicas favoritas em pouco tempo.",

    Modules: [
      {
        Title: "Módulo 1: Introdução ao Violão",
        Lessons: [
          {
            Title: "Aula 1: Conhecendo o Violão",
            Duration: "10 min",
            Status: "completed",
          },
          {
            Title: "Aula 2: Afinando o Violão",
            Duration: "15 min",
            Status: "completed",
          },
        ],
      },

      {
        Title: "Módulo 2: Primeiros Acordes",
        Lessons: [
          {
            Title: "Aula 1: Acordes Básicos (C, G, D)",
            Duration: "12 min",
            Status: "completed",
          },
          {
            Title: "Aula 2: Mudança de Acordes",
            Duration: "14 min",
            Status: "completed",
          },
          {
            Title: "Aula 3: Praticando os Primeiros Acordes",
            Duration: "18 min",
            Status: "current",
          },
        ],
      },

      {
        Title: "Módulo 3: Ritmo e Batidas",
        Lessons: [
          {
            Title: "Aula 1: Entendendo o Ritmo",
            Duration: "11 min",
            Status: "locked",
          },
          {
            Title: "Aula 2: Primeiras Batidas no Violão",
            Duration: "16 min",
            Status: "locked",
          },
          {
            Title: "Aula 3: Tocando com Ritmo",
            Duration: "20 min",
            Status: "locked",
          },
        ],
      },

      {
        Title: "Módulo 4: Tocando Suas Primeiras Músicas",
        Lessons: [
          {
            Title: "Aula 1: Música Simples com 2 Acordes",
            Duration: "15 min",
            Status: "locked",
          },
          {
            Title: "Aula 2: Música com 3 Acordes",
            Duration: "18 min",
            Status: "locked",
          },
        ],
      },

      {
        Title: "Módulo 5: Técnicas Iniciais",
        Lessons: [
          {
            Title: "Aula 1: Dedilhado Básico",
            Duration: "17 min",
            Status: "locked",
          },
          {
            Title: "Aula 2: Controle de Dinâmica",
            Duration: "13 min",
            Status: "locked",
          },
          {
            Title: "Aula 3: Exercícios de Coordenação",
            Duration: "19 min",
            Status: "locked",
          },
        ],
      },
    ],
  };

  const aulaatual = Curso.Modules.flatMap((module) => module.Lessons).find(
    (lesson) => lesson.Status === "current",
  );

  const [openModules, setOpenModules] = useState<string[]>([]);

  const toggleModule = (title: string) => {
    setOpenModules((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  return (
    <>
      <div className="bg-secondary flex max-w-4xl flex-col-reverse items-center justify-between gap-10 rounded-2xl p-6 md:flex-row">
        <div className="flex flex-col gap-2 md:w-2xl">
          <h1 className="text-3xl font-bold text-white">
            Bem-vindo de volta, {user.name}!
          </h1>
          <p className="text-base text-white/60">
            Continue firme! Você já completou quase metade do curso.
          </p>
          <ProgressBar label="Aulas Concluídas" current={5} max={10} />
          <div className="bg-primary hover:bg-primary-dark flex size-fit cursor-pointer items-center gap-2 rounded-lg px-6 py-3 text-white">
            <MdOutlinePlayCircleFilled className="size-5" />
            <p className="text-base">Continuar: {aulaatual?.Title}</p>
          </div>
        </div>
        <div className="relative size-52 rotate-3 overflow-hidden rounded-2xl">
          <Image
            src="https://images.unsplash.com/photo-1474752651386-dc296d69dc90?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="foto"
            fill
            className="object-cover"
            quality={60}
          />
        </div>
      </div>
      <div className="flex w-full max-w-4xl flex-col gap-5">
        <h1 className="text-secondary border-b-2 border-black/20 pb-5 text-xl font-bold">
          Seus Módulos
        </h1>
        {Curso.Modules.map((module) => {
          const totalLessons = module.Lessons.length;

          const completedLessons = module.Lessons.filter(
            (lesson) => lesson.Status === "completed",
          ).length;

          const hasCurrentLesson = module.Lessons.some(
            (lesson) => lesson.Status === "current",
          );

          const allLocked = module.Lessons.every(
            (lesson) => lesson.Status === "locked",
          );

          let message = "";
          let status = "";
          let IconComponent = MdLock;
          let iconBgClass = "";
          let iconColorClass = "";
          let badgeClass = "";

          if (completedLessons === totalLessons) {
            message = `${completedLessons} de ${totalLessons} aulas completadas`;
            status = "Concluído";
            IconComponent = MdCheckCircle;
            iconBgClass = "bg-green-200";
            iconColorClass = "text-green-700";
            badgeClass = "bg-green-200 text-green-700";
          } else if (hasCurrentLesson) {
            message = `Em progresso (${completedLessons} de ${totalLessons} aulas)`;
            status = "Em andamento";
            IconComponent = MdPlayArrow;
            iconBgClass = "bg-primary";
            iconColorClass = "text-white";
            badgeClass = "bg-orange-200 text-primary";
          } else if (allLocked) {
            message = "Complete o módulo anterior";
            status = "Bloqueado";
            IconComponent = MdLock;
            iconBgClass = "bg-gray-200";
            iconColorClass = "text-gray-700";
            badgeClass = "bg-gray-200 text-gray-700";
          }

          const isOpen = openModules.includes(module.Title);

          return (
            <div
              key={module.Title}
              className={`flex flex-col items-center justify-between overflow-hidden rounded-2xl`}
            >
              <div
                onClick={() => toggleModule(module.Title)}
                className={`flex w-full cursor-pointer items-center justify-between p-6 ${status === "Bloqueado" ? "bg-zinc-700" : "bg-secondary hover:bg-secondary-light"}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-2 ${iconBgClass}`}>
                    <IconComponent className={`size-5 ${iconColorClass}`} />
                  </div>

                  <div>
                    <h1 className="font-bold text-white">{module.Title}</h1>
                    <p className="text-sm text-white/60">{message}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div
                    className={`rounded-full px-2 py-1 text-sm font-semibold ${badgeClass} hidden md:block`}
                  >
                    {status}
                  </div>
                  <MdArrowBackIos
                    className={`transition-transform duration-300 ${isOpen ? "text-primary rotate-90" : "rotate-270 text-white/50"}`}
                  />
                </div>
              </div>
              <div
                className={`grid w-full transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div
                    className={`flex size-full flex-col gap-4 p-6 ${status === "Bloqueado" ? "cursor-not-allowed bg-zinc-600" : "bg-secondary-light cursor-pointer"} `}
                  >
                    {module.Lessons.map((lesson) => {
                      let Icon = MdLock;
                      let iconColor = "text-gray-500";

                      if (lesson.Status === "completed") {
                        Icon = MdCheckCircle;
                        iconColor = "text-green-500";
                      }

                      if (lesson.Status === "current") {
                        Icon = MdPlayArrow;
                        iconColor = "text-primary";
                      }

                      return (
                        <Link
                          href="/a"
                          onClick={(e) => {
                            if (lesson.Status === "locked") {
                              e.preventDefault();
                            }
                          }}
                          key={lesson.Title}
                          className={`flex items-center justify-between rounded-lg p-2 ${lesson.Status === "locked" ? "cursor-not-allowed bg-gray-100" : "cursor-pointer bg-gray-100 hover:bg-gray-400"} `}
                        >
                          <div className="flex items-center gap-4">
                            <Icon className={`size-5 ${iconColor}`} />
                            <p className="text-sm">{lesson.Title}</p>
                          </div>
                          <div className="text-xs font-light">
                            {lesson.Duration}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
