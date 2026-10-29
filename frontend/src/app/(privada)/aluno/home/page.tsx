"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/components/ui/Toast";
import {
  MdChevronRight,
  MdExpandMore,
  MdOutlineAdminPanelSettings,
  MdOutlineMenuBook,
  MdOutlinePlayCircleFilled,
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
        // Q10: Distinguir catálogo vazio de erro técnico/rede
        const isCatalogEmpty =
          result.error.toLowerCase().includes("nenhum curso publicado") ||
          result.error.toLowerCase().includes("nenhum curso disponivel");

        if (isCatalogEmpty) {
          setLoadError(null);
        } else {
          setLoadError(result.error);
          toast("Curso indisponível", {
            description: result.error,
            variant: "error",
          });
        }
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
        className="border-accent/30 bg-accent/10 text-accent-text hover:bg-accent/15 focus-visible:ring-accent inline-flex items-center gap-2 rounded-[var(--radius-control)] border px-3.5 py-2 text-xs font-semibold transition-colors outline-none focus-visible:ring-2"
      >
        <MdOutlineAdminPanelSettings className="size-4" aria-hidden="true" />
        Painel Administrativo
      </Link>
    </div>
  );

  // 1. Loading State (using Skeleton)
  if (loading && !course) {
    return (
      <div
        className="mx-auto flex w-full max-w-5xl flex-col gap-6"
        aria-busy="true"
        aria-label="Carregando dados do curso"
      >
        <span className="sr-only">Carregando conteúdo do curso...</span>
        {adminButton}
        <div className="border-border bg-panel rounded-[var(--radius-panel)] border p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-6 w-32 rounded-[var(--radius-xs)]" />
              <Skeleton className="h-9 w-3/4 rounded-[var(--radius-xs)]" />
              <Skeleton className="h-4 w-full rounded-[var(--radius-xs)]" />
              <Skeleton className="h-4 w-2/3 rounded-[var(--radius-xs)]" />
              <Skeleton className="mt-4 h-11 w-44 rounded-full" />
            </div>
            <Skeleton className="aspect-video w-full rounded-[var(--radius-panel)]" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-48 rounded-[var(--radius-xs)]" />
          <Skeleton className="h-20 w-full rounded-[var(--radius-panel)]" />
          <Skeleton className="h-20 w-full rounded-[var(--radius-panel)]" />
        </div>
      </div>
    );
  }

  // 2. Error State (Q10: erro técnico/rede ≠ vazio legítimo)
  if (loadError) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col items-center justify-center p-4">
        {adminButton}
        <ErrorState
          title="Não foi possível carregar seu curso"
          description={loadError}
          onRetry={fetchCourse}
          className="border-border bg-panel w-full rounded-[var(--radius-panel)] border p-8"
        />
      </div>
    );
  }

  // 3. Empty State (Q10: alcançável quando catálogo está vazio)
  if (!course) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col items-center justify-center p-4">
        {adminButton}
        <EmptyState
          title="Nenhum curso disponível no momento"
          description="Assim que novos conteúdos forem publicados pelo instrutor, você os verá listados aqui."
          icon={<MdOutlineMenuBook className="text-text-muted size-10" />}
          className="border-border bg-panel w-full rounded-[var(--radius-panel)] border p-8 text-center"
        />
      </div>
    );
  }

  const modules = course.modules ?? [];
  const totalLessons = modules.reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0,
  );
  const firstLesson =
    modules.length > 0 && modules[0].lessons?.length
      ? modules[0].lessons[0]
      : null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      {adminButton}

      {/* Hero / Curso Card (Q08: honesto, sem afirmações sem dados) */}
      <section
        aria-labelledby="hero-course-heading"
        className="border-border bg-panel relative overflow-hidden rounded-[var(--radius-panel)] border p-6 shadow-[var(--shadow-panel)] transition-colors sm:p-8"
      >
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="accent" className="text-xs font-semibold">
                Curso disponível
              </Badge>
              <span className="text-text-muted text-xs">
                {modules.length} {modules.length === 1 ? "módulo" : "módulos"} ·{" "}
                {totalLessons} {totalLessons === 1 ? "aula" : "aulas"}
              </span>
            </div>

            <h1
              id="hero-course-heading"
              className="text-text text-2xl font-bold tracking-tight text-balance sm:text-3xl"
            >
              Bem-vindo de volta, {displayName}!
            </h1>

            <p className="text-text-muted text-sm leading-relaxed sm:text-base">
              Acesse o curso{" "}
              <strong className="text-text font-medium">{course.title}</strong>{" "}
              e acompanhe as aulas organizadas por módulo.
            </p>

            {course.description && (
              <p className="text-text-muted line-clamp-2 text-xs sm:text-sm">
                {course.description}
              </p>
            )}

            {firstLesson ? (
              <div className="mt-3 flex items-center gap-3">
                {/* Q04: ButtonLink sem aninhamento <a><button> */}
                <ButtonLink
                  href={`/aluno/aula/${firstLesson.id}`}
                  variant="primary"
                  size="md"
                  className="gap-2 font-semibold shadow-sm"
                  aria-label={`Abrir curso: ${firstLesson.title}`}
                >
                  <MdOutlinePlayCircleFilled
                    className="size-5"
                    aria-hidden="true"
                  />
                  <span>Abrir curso</span>
                </ButtonLink>
                <span className="text-text-muted hidden truncate text-xs sm:inline">
                  Começar pela primeira aula: {firstLesson.title}
                </span>
              </div>
            ) : (
              <p className="text-text-muted mt-2 text-xs italic">
                Nenhuma aula cadastrada ainda neste curso.
              </p>
            )}
          </div>

          {/* Thumbnail preview (Q02: Image unoptimized para MinIO/storage) */}
          <div className="border-border bg-media relative aspect-video w-full overflow-hidden rounded-[var(--radius-control)] border">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={`Capa do curso ${course.title}`}
                fill
                sizes="(max-width: 768px) 100vw, 360px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-800 to-neutral-900 text-white/50">
                <MdOutlineMenuBook className="size-10" />
                <span className="text-xs font-medium">{course.title}</span>
              </div>
            )}
            {firstLesson && (
              <Link
                href={`/aluno/aula/${firstLesson.id}`}
                aria-label={`Iniciar aula ${firstLesson.title}`}
                className="group focus-visible:ring-accent absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs transition-opacity hover:bg-black/20 focus-visible:ring-2 focus-visible:outline-none"
              >
                {/* Q17: reduced-motion sem transform */}
                <span className="bg-accent flex size-14 items-center justify-center rounded-full text-[var(--on-accent)] shadow-lg transition-transform group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                  <MdOutlinePlayCircleFilled
                    className="size-8"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Curriculum Accordion */}
      <section aria-labelledby="curriculum-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2
              id="curriculum-heading"
              className="text-text text-lg font-bold tracking-tight sm:text-xl"
            >
              Grade curricular
            </h2>
            <p className="text-text-muted text-xs sm:text-sm">
              Explore os módulos e acesse o conteúdo das aulas
            </p>
          </div>
          <span className="text-text-muted text-xs">
            {modules.length} {modules.length === 1 ? "módulo" : "módulos"}
          </span>
        </div>

        {modules.length === 0 ? (
          <div className="border-border bg-panel text-text-muted rounded-[var(--radius-panel)] border p-8 text-center text-sm">
            Nenhum módulo publicado para este curso até o momento.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {modules.map((moduleItem, modIdx) => {
              const isOpen = openModules.includes(moduleItem.id);
              const moduleLessons = moduleItem.lessons || [];
              const modTotalLessons = moduleLessons.length;

              return (
                <div
                  key={moduleItem.id}
                  className="border-border bg-panel overflow-hidden rounded-[var(--radius-panel)] border shadow-[var(--shadow-panel)] transition-colors"
                >
                  {/* Module Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleModule(moduleItem.id)}
                    aria-expanded={isOpen}
                    aria-controls={`module-content-${moduleItem.id}`}
                    className="hover:bg-canvas focus-visible:ring-accent flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset sm:p-5"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      {/* Q11: text-accent-text para contraste */}
                      <div className="bg-accent/15 text-accent-text flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                        {modIdx + 1}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-text truncate text-sm font-semibold sm:text-base">
                          {moduleItem.title}
                        </h3>
                        <p className="text-text-muted text-xs">
                          {modTotalLessons}{" "}
                          {modTotalLessons === 1 ? "aula" : "aulas"}
                        </p>
                      </div>
                    </div>

                    <div className="ml-2 flex shrink-0 items-center gap-3">
                      <MdExpandMore
                        className={`text-text-muted size-5 transition-transform duration-200 motion-reduce:transition-none ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                  </button>

                  {/* Module Lessons List */}
                  {isOpen && (
                    <div
                      id={`module-content-${moduleItem.id}`}
                      className="border-border bg-canvas/40 border-t px-2 py-3 sm:px-4"
                    >
                      {modTotalLessons === 0 ? (
                        <p className="text-text-muted p-3 text-xs italic">
                          Nenhuma aula cadastrada neste módulo.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {moduleLessons.map((lesson, idx) => (
                            <Link
                              key={lesson.id}
                              href={`/aluno/aula/${lesson.id}`}
                              className="group hover:bg-panel focus-visible:ring-accent flex items-center justify-between rounded-[var(--radius-control)] p-3 text-sm transition-colors hover:shadow-xs focus-visible:ring-2 focus-visible:outline-none"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                {/* Q11 e Q17: text-accent-text e reduced-motion sem scale */}
                                <MdPlayArrow
                                  className="text-accent-text size-4 shrink-0 transition-transform group-hover:scale-125 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                  aria-hidden="true"
                                />
                                <span className="text-text truncate text-xs font-medium sm:text-sm">
                                  {idx + 1}. {lesson.title}
                                </span>
                              </div>

                              <div className="ml-3 flex shrink-0 items-center gap-2">
                                {lesson.duration_in_minutes ? (
                                  <span className="text-text-muted text-xs font-medium">
                                    {lesson.duration_in_minutes} min
                                  </span>
                                ) : (
                                  <span className="text-text-muted text-xs">
                                    Vídeo
                                  </span>
                                )}
                                <MdChevronRight
                                  className="text-text-muted size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                                  aria-hidden="true"
                                />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
