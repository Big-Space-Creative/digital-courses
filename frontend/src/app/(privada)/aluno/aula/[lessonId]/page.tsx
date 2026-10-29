import Link from "next/link";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ErrorState } from "@/components/ui/ErrorState";
import LessonTabs from "./LessonTabs";
import {
  MdAccessTime,
  MdArrowBack,
  MdArrowForward,
  MdMenuBook,
  MdOutlinePlayCircleFilled,
  MdPlayArrow,
} from "react-icons/md";
import { getLessonDetailAction } from "@/app/actions/courses";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default async function Lesson({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lessonIdNumber = Number(lessonId);
  const result = await getLessonDetailAction(lessonIdNumber);

  if (!result.success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <ErrorState
          title="Aula indisponível"
          description={result.error}
          action={
            /* Q04: ButtonLink sem <a><button> */
            <ButtonLink href="/aluno/home" variant="primary">
              Voltar para a trilha
            </ButtonLink>
          }
          className="border-border bg-panel w-full max-w-lg rounded-[var(--radius-panel)] border p-8 text-center"
        />
      </div>
    );
  }

  const lesson = result.data;
  const course = lesson.module.course;

  // Flatten all lessons in order to calculate Anterior / Próxima (M01)
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const resumo =
    lesson.description ||
    "Esta aula ainda não possui uma descrição detalhada cadastrada.";
  const dicas =
    lesson.module.description ||
    course.description ||
    "Siga a ordem das aulas e pratique no seu próprio ritmo.";

  const materials = lesson.materials.map((material) => ({
    id: material.id,
    title: material.title,
    url: material.file_path,
    type: material.type,
  }));

  const comments = lesson.comments.map((comment) => ({
    id: comment.id,
    userId: comment.user?.id,
    author: comment.user?.name ?? "Aluno",
    avatar: initials(comment.user?.name ?? "Aluno"),
    message: comment.content,
    createdAt: comment.created_at ?? null,
    adminReply: null,
  }));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Breadcrumb / Top Bar */}
      <nav
        aria-label="Localização na trilha"
        className="text-text-muted flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm"
      >
        <div className="flex items-center gap-2">
          {/* Q11: text-accent-text */}
          <Link
            href="/aluno/home"
            className="hover:text-accent-text inline-flex items-center gap-1.5 font-medium transition-colors"
          >
            <MdArrowBack className="size-4" />
            <span>Voltar aos módulos</span>
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text max-w-[200px] truncate font-medium sm:max-w-xs">
            {course.title}
          </span>
        </div>

        {/* Anterior / Próxima navigation (Q04: ButtonLink com aria-label persistente) */}
        <div className="flex items-center gap-2">
          {prevLesson ? (
            <ButtonLink
              href={`/aluno/aula/${prevLesson.id}`}
              variant="secondary"
              size="sm"
              className="gap-1.5 text-xs"
              aria-label={`Aula anterior: ${prevLesson.title}`}
            >
              <MdArrowBack className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Anterior</span>
            </ButtonLink>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              disabled
              className="gap-1.5 text-xs opacity-50"
              aria-label="Não há aula anterior"
            >
              <MdArrowBack className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
          )}

          {nextLesson ? (
            <ButtonLink
              href={`/aluno/aula/${nextLesson.id}`}
              variant="primary"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              aria-label={`Próxima aula: ${nextLesson.title}`}
            >
              <span className="hidden sm:inline">Próxima</span>
              <MdArrowForward className="size-3.5" aria-hidden="true" />
            </ButtonLink>
          ) : (
            <Button
              variant="primary"
              size="sm"
              disabled
              className="gap-1.5 text-xs opacity-50"
              aria-label="Não há próxima aula"
            >
              <span className="hidden sm:inline">Próxima</span>
              <MdArrowForward className="size-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </nav>

      {/* Main Content: Video + Tabs vs Curriculum Sidebar */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_336px]">
        {/* Left: Video Player + Tabs */}
        <main className="flex min-w-0 flex-col gap-6">
          {/* Video Container (C05: player sempre bg-media) */}
          <section
            aria-label="Reprodução da videoaula"
            className="w-full overflow-hidden"
          >
            <VideoPlayer
              lessonVideoUrl={lesson.video_url ?? ""}
              title={lesson.title}
            />
          </section>

          {/* Lesson Header Information */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{lesson.module.title}</Badge>
              {lesson.duration_in_minutes ? (
                <span className="text-text-muted inline-flex items-center gap-1 text-xs">
                  <MdAccessTime className="size-3.5" aria-hidden="true" />
                  {lesson.duration_in_minutes} min de aula
                </span>
              ) : null}
            </div>

            <h1 className="text-text text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
              {lesson.title}
            </h1>
          </div>

          {/* Lesson Tabs Container */}
          <section
            aria-label="Detalhes e comunidade da aula"
            className="border-border bg-panel overflow-hidden rounded-[var(--radius-panel)] border shadow-[var(--shadow-panel)]"
          >
            <LessonTabs
              lessonId={lesson.id}
              resumo={resumo}
              dicas={dicas}
              materials={materials}
              comments={comments}
            />
          </section>
        </main>

        {/* Right / Sidebar: Course Curriculum Navigation (Desktop 336px sticky, mobile full-width below) */}
        <aside
          aria-label="Currículo do curso"
          className="border-border bg-panel flex flex-col overflow-hidden rounded-[var(--radius-panel)] border shadow-[var(--shadow-panel)] lg:sticky lg:top-24"
        >
          {/* Curriculum Header */}
          <div className="border-border border-b p-4">
            <div className="flex items-center gap-2">
              {/* Q11: text-accent-text */}
              <MdMenuBook className="text-accent-text size-5" />
              <h2 className="text-text truncate text-sm font-bold">
                Conteúdo do curso
              </h2>
            </div>
            <p className="text-text-muted mt-1 truncate text-xs">
              {course.title}
            </p>
          </div>

          {/* Curriculum List (Q08: ícone neutro para aulas disponíveis, sem checks fictícios) */}
          <div className="divide-border/60 max-h-[600px] divide-y overflow-y-auto">
            {course.modules.map((moduleItem) => (
              <div key={moduleItem.id} className="py-2">
                {/* Q11: text-xs em vez de text-[11px] (mínimo 12px) */}
                <div className="text-text-muted px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
                  {moduleItem.title}
                </div>

                <div className="flex flex-col gap-0.5 px-2">
                  {moduleItem.lessons.map((courseLesson) => {
                    const isCurrent = courseLesson.id === lesson.id;

                    return (
                      <Link
                        key={courseLesson.id}
                        href={`/aluno/aula/${courseLesson.id}`}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`group focus-visible:ring-accent flex items-start gap-3 rounded-[var(--radius-control)] p-2.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                          isCurrent
                            ? "bg-accent/15 text-text border-accent border-l-2 font-semibold"
                            : "hover:bg-canvas text-text-muted hover:text-text"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCurrent ? (
                            <MdOutlinePlayCircleFilled
                              className="text-accent-text size-4"
                              aria-hidden="true"
                            />
                          ) : (
                            <MdPlayArrow
                              className="text-text-muted size-4"
                              aria-hidden="true"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 leading-tight">
                            {courseLesson.title}
                          </p>
                          {/* Q11: text-xs em vez de text-[10px] (mínimo 12px) */}
                          <span className="text-text-muted mt-1 block text-xs">
                            {courseLesson.duration_in_minutes
                              ? `${courseLesson.duration_in_minutes} min`
                              : "Vídeo"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Link to Modules (Q04: ButtonLink) */}
          <div className="border-border bg-canvas/40 border-t p-3">
            <ButtonLink
              href="/aluno/home"
              variant="secondary"
              size="sm"
              className="w-full text-xs"
            >
              Ver todos os módulos
            </ButtonLink>
          </div>
        </aside>
      </div>
    </div>
  );
}
