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
        className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 shadow-sm transition hover:bg-orange-100 hover:shadow-md"
      >
        <MdOutlineAdminPanelSettings size={20} />
        Acessar Painel Administrativo
      </Link>
    </div>
  );

  if (loading && !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6">
        {adminButton}
        <p className="animate-pulse text-gray-500">
          Carregando trilha de aprendizado...
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 p-6">
        {adminButton}
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-secondary text-2xl font-bold">
            Nenhum curso disponível agora
          </h1>
          <p className="mt-2 text-sm text-gray-500">
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

      <div className="bg-secondary flex w-full flex-col-reverse items-center justify-between gap-10 rounded-2xl p-6 md:flex-row">
        <div className="flex flex-col gap-2 md:w-2xl">
          <h1 className="text-3xl font-bold text-white">
            Bem-vindo de volta, {displayName}!
          </h1>
          <p className="text-base text-white/60">
            Você está cursando <strong>{course.title}</strong>.
          </p>
          {course.description && (
            <p className="max-w-2xl text-sm leading-6 text-white/75">
              {course.description}
            </p>
          )}
          <ProgressBar
            label="Aulas concluídas"
            current={completedLessons}
            max={totalLessons === 0 ? 1 : totalLessons}
          />
          {currentLesson && (
            <Link
              href={`/aluno/aula/${currentLesson.id}`}
              className="bg-primary hover:bg-primary-dark mt-2 flex size-fit items-center gap-2 rounded-lg px-6 py-3 text-white transition-colors"
            >
              <MdOutlinePlayCircleFilled className="size-5" />
              <p className="text-base">Continuar curso</p>
            </Link>
          )}
        </div>

        <div className="relative size-52 rotate-3 overflow-hidden rounded-2xl shadow-xl">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-300 to-amber-600">
              <span className="text-6xl font-bold text-white/50">
                {course.title.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-5">
        <h1 className="text-secondary border-b-2 border-black/20 pb-5 text-xl font-bold">
          Trilha de aprendizado
        </h1>

        {modules.length === 0 && (
          <p className="text-gray-500">Este curso ainda não possui módulos.</p>
        )}

        {modules.map((moduleItem) => {
          const moduleLessons = moduleItem.lessons ?? [];
          const modTotalLessons = moduleLessons.length;
          const isOpen = openModules.includes(moduleItem.id);

          return (
            <div
              key={moduleItem.id}
              className="flex flex-col items-center justify-between overflow-hidden rounded-xl border border-gray-100 shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleModule(moduleItem.id)}
                aria-expanded={isOpen}
                aria-controls={`module-content-${moduleItem.id}`}
                className="flex w-full cursor-pointer items-center justify-between bg-white p-6 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary rounded-full p-2 text-white">
                    <MdPlayArrow className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">{moduleItem.title}</h2>
                    <p className="text-sm text-gray-500">
                      {modTotalLessons} {modTotalLessons === 1 ? "aula" : "aulas"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-orange-200 text-primary hidden rounded-full px-3 py-1 text-xs font-semibold md:block">
                    Acessível
                  </div>
                  <MdArrowBackIos
                    className={`text-gray-400 transition-transform duration-300 ${
                      isOpen ? "rotate-90" : "-rotate-90"
                    }`}
                  />
                </div>
              </button>

              <div
                id={`module-content-${moduleItem.id}`}
                className={`grid w-full transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden bg-gray-50">
                  <div className="flex w-full flex-col gap-2 p-4">
                    {moduleLessons.map((lesson, idx) => (
                      <Link
                        href={`/aluno/aula/${lesson.id}`}
                        key={lesson.id}
                        className="flex items-center justify-between rounded-lg border border-transparent p-3 transition-colors hover:border-gray-200 hover:bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <MdPlayArrow className="size-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {idx + 1}. {lesson.title}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-gray-500">
                          {lesson.duration_in_minutes
                            ? `${lesson.duration_in_minutes} min`
                            : "Vídeo"}
                        </span>
                      </Link>
                    ))}

                    {modTotalLessons === 0 && (
                      <p className="p-3 text-sm text-gray-500">
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
