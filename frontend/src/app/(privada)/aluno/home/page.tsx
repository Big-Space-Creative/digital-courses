"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import ProgressBar from "@/components/ui/ProgressBar";
import { toast } from "@/components/ui/Toast";
import { useUser } from "@/context/UserContext";
import {
  MdArrowBackIos,
  MdOutlinePlayCircleFilled,
  MdOutlineAdminPanelSettings,
  MdPlayArrow,
} from "react-icons/md";
import {
  getFirstPublishedCourseAction,
  type ApiCourse,
  type ApiModule,
} from "@/app/actions/courses";

type CourseWithModules = ApiCourse & { modules: ApiModule[] };

export default function Home() {
  const { user } = useUser();
  const [course, setCourse] = useState<CourseWithModules | null>(null);
  const [loading, startLoading] = useTransition();
  const [openModules, setOpenModules] = useState<number[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isPrivileged = user?.role === "admin" || user?.role === "instructor";
  const displayName = user?.name?.split(" ")[0] ?? "Aluno";

  const fetchCourse = useCallback(() => {
    startLoading(async () => {
      const result = await getFirstPublishedCourseAction();

      if (!result.success) {
        setCourse(null);
        setLoadError(result.error);
        toast("Curso indisponível", {
          description: result.error,
          variant: "error",
        });
        return;
      }

      setLoadError(null);
      setCourse(result.data);
      if (result.data.modules?.length) {
        setOpenModules([result.data.modules[0].id]);
      }
    });
  }, []);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const toggleModule = (moduleId: number) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  const adminButton = isPrivileged && (
    <div className="flex justify-end">
      <Link
        href="/admin/dashboard"
        className="border-accent/25 bg-accent/10 text-accent hover:bg-accent/15 rounded-bento-md inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors"
      >
        <MdOutlineAdminPanelSettings size={20} />
        Acessar Painel Administrativo
      </Link>
    </div>
  );

  if (loading && !course) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 p-4 sm:p-6 lg:p-8">
        {adminButton}
        <div className="rounded-bento-lg shimmer h-64 w-full md:h-56" />
        <div className="flex flex-col gap-5">
          <div className="shimmer rounded-bento-sm h-7 w-56" />
          <div className="shimmer rounded-bento-md h-20 w-full" />
          <div className="shimmer rounded-bento-md h-20 w-full" />
          <div className="shimmer rounded-bento-md h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 p-6">
        {adminButton}
        <div className="border-ink/10 bg-surface-soft rounded-bento-md w-full border p-8 text-center">
          <h1 className="text-ink text-2xl font-bold">
            Nenhum curso disponível agora
          </h1>
          <p className="text-ink/60 mt-2 text-sm">
            {loadError ??
              "Assim que o administrador publicar um curso, ele aparecerá aqui."}
          </p>
        </div>
      </div>
    );
  }

  const modules = course.modules ?? [];
  const totalLessons = modules.reduce(
    (acc, moduleItem) => acc + (moduleItem.lessons?.length || 0),
    0,
  );
  const completedLessons = 0;
  const currentLesson =
    modules.length > 0 && modules[0].lessons?.length
      ? modules[0].lessons[0]
      : null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 p-4 sm:p-6 lg:p-8">
      {adminButton}

      <div className="bg-ink rounded-bento-lg grid gap-6 overflow-hidden p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
        <div className="flex flex-col justify-center gap-3">
          <h1 className="text-surface text-3xl font-bold text-balance">
            Bem-vindo de volta, {displayName}!
          </h1>
          <p className="text-surface/60 text-base">
            Você está cursando{" "}
            <strong className="text-surface/90">{course.title}</strong>.
          </p>
          {course.description && (
            <p className="text-surface/75 max-w-2xl text-sm leading-6 text-pretty">
              {course.description}
            </p>
          )}
          <div className="mt-1">
            <ProgressBar
              label="Aulas concluídas"
              current={completedLessons}
              max={totalLessons === 0 ? 1 : totalLessons}
            />
          </div>
          {currentLesson && (
            <Link
              href={`/aluno/aula/${currentLesson.id}`}
              className="gradient-animate mt-2 flex size-fit items-center gap-2 rounded-full px-6 py-3 text-white transition-transform duration-150 ease-out hover:-translate-y-0.5"
              style={{ backgroundImage: "var(--gradient-pulse)" }}
            >
              <MdOutlinePlayCircleFilled className="size-5" />
              <p className="text-base">Continuar curso</p>
            </Link>
          )}
        </div>

        <div className="rounded-bento-md relative min-h-[220px] overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="from-accent-500 to-accent-400 absolute inset-0 flex items-center justify-center bg-gradient-to-br">
              <span className="text-6xl font-bold text-white/50">
                {course.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="from-ink via-ink/10 absolute inset-0 bg-gradient-to-t to-transparent" />
          {currentLesson && (
            <Link
              href={`/aluno/aula/${currentLesson.id}`}
              aria-label="Continuar assistindo"
              className="focus-visible:ring-accent absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out hover:scale-[1.03] focus-visible:ring-2 focus-visible:outline-none"
            >
              <span className="text-ink grid size-16 place-items-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
                <MdOutlinePlayCircleFilled size={32} />
              </span>
            </Link>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
            <p className="text-surface text-sm font-medium">{course.title}</p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-5">
        <h1 className="text-ink border-ink/15 border-b-2 pb-5 text-xl font-bold">
          Trilha de aprendizado
        </h1>

        {modules.length === 0 && (
          <p className="text-ink/60">Este curso ainda não possui módulos.</p>
        )}

        {modules.map((moduleItem) => {
          const moduleLessons = moduleItem.lessons ?? [];
          const modTotalLessons = moduleLessons.length;
          const isOpen = openModules.includes(moduleItem.id);

          return (
            <div
              key={moduleItem.id}
              className="border-ink/10 rounded-bento-md flex flex-col items-center justify-between overflow-hidden border transition-shadow hover:shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleModule(moduleItem.id)}
                aria-expanded={isOpen}
                aria-controls={`module-content-${moduleItem.id}`}
                className="bg-surface-soft hover:bg-ink/5 flex w-full cursor-pointer items-center justify-between p-6 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-accent rounded-full p-2 text-white">
                    <MdPlayArrow className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-ink font-bold">{moduleItem.title}</h2>
                    <p className="text-ink/55 text-sm">
                      {modTotalLessons}{" "}
                      {modTotalLessons === 1 ? "aula" : "aulas"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-accent/15 text-accent hidden rounded-full px-3 py-1 text-xs font-semibold md:block">
                    Acessível
                  </div>
                  <MdArrowBackIos
                    className={`text-ink/35 transition-transform duration-300 ease-out ${
                      isOpen ? "rotate-90" : "-rotate-90"
                    }`}
                  />
                </div>
              </button>

              <div
                id={`module-content-${moduleItem.id}`}
                className={`grid w-full transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="bg-surface overflow-hidden">
                  <div className="flex w-full flex-col gap-2 p-4">
                    {moduleLessons.map((lesson, idx) => (
                      <Link
                        href={`/aluno/aula/${lesson.id}`}
                        key={lesson.id}
                        className="hover:border-ink/10 hover:bg-surface-soft flex items-center justify-between rounded-lg border border-transparent p-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <MdPlayArrow className="text-ink/35 size-5" />
                          <span className="text-ink/80 text-sm font-medium">
                            {idx + 1}. {lesson.title}
                          </span>
                        </div>
                        <span className="text-ink/50 text-xs font-medium">
                          {lesson.duration_in_minutes
                            ? `${lesson.duration_in_minutes} min`
                            : "Vídeo"}
                        </span>
                      </Link>
                    ))}

                    {modTotalLessons === 0 && (
                      <p className="text-ink/55 p-3 text-sm">
                        Nenhuma aula neste módulo.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
