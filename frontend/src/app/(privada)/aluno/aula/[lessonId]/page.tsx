import Link from "next/link";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import LessonTabs from "./LessonTabs";
import {
  MdAccessTime,
  MdArrowBack,
  MdArrowForward,
  MdCheckCircle,
  MdMenuBook,
  MdOutlinePlayCircleFilled,
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
            <Link href="/aluno/home">
              <Button variant="primary">Voltar para a trilha</Button>
            </Link>
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
          <Link
            href="/aluno/home"
            className="hover:text-accent inline-flex items-center gap-1.5 font-medium transition-colors"
          >
            <MdArrowBack className="size-4" />
            <span>Voltar aos módulos</span>
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text max-w-[200px] truncate font-medium sm:max-w-xs">
            {course.title}
          </span>
        </div>

        {/* Anterior / Próxima navigation (M01) */}
        <div className="flex items-center gap-2">
          {prevLesson ? (
            <Link
              href={`/aluno/aula/${prevLesson.id}`}
              title={`Aula anterior: ${prevLesson.title}`}
            >
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                <MdArrowBack className="size-3.5" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>
            </Link>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              disabled
              className="gap-1.5 text-xs opacity-50"
            >
              <MdArrowBack className="size-3.5" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
          )}

          {nextLesson ? (
            <Link
              href={`/aluno/aula/${nextLesson.id}`}
              title={`Próxima aula: ${nextLesson.title}`}
            >
              <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                <span className="hidden sm:inline">Próxima</span>
                <MdArrowForward className="size-3.5" />
              </Button>
            </Link>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              disabled
              className="gap-1.5 text-xs opacity-50"
            >
              <span className="hidden sm:inline">Próxima</span>
              <MdArrowForward className="size-3.5" />
            </Button>
          )}
        </div>
      </nav>

      {/* Main Layout: 1 col on mobile (<1024px), 2 col grid on desktop (C01) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left Column: Video + Header + Tabs */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Video Player (C05, C09) */}
          <VideoPlayer
            lessonVideoUrl={lesson.video_url ?? ""}
            title={lesson.title}
          />

          {/* Lesson Header Information */}
          <div className="border-border bg-panel rounded-[var(--radius-panel)] border p-5 shadow-[var(--shadow-panel)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="accent"
                  className="text-xs font-semibold uppercase"
                >
                  {lesson.module.title}
                </Badge>
                {lesson.duration_in_minutes && (
                  <span className="text-text-muted inline-flex items-center gap-1 text-xs">
                    <MdAccessTime className="size-3.5" />
                    {lesson.duration_in_minutes} min
                  </span>
                )}
              </div>
              <Badge variant="neutral" className="text-xs">
                Aula {currentIndex + 1} de {allLessons.length}
              </Badge>
            </div>

            <h1 className="text-text text-xl font-bold tracking-tight text-balance sm:text-2xl">
              {lesson.title}
            </h1>
          </div>

          {/* Tabs: Resumo e Comentários */}
          <div className="border-border bg-panel overflow-hidden rounded-[var(--radius-panel)] border shadow-[var(--shadow-panel)]">
            <LessonTabs
              lessonId={lesson.id}
              resumo={resumo}
              dicas={dicas}
              materials={materials}
              comments={comments}
            />
          </div>
        </div>

        {/* Right Column: Curriculum (C01: desktop sidebar, mobile accordion) */}
        <aside
          aria-label="Conteúdo do curso"
          className="border-border bg-panel flex flex-col overflow-hidden rounded-[var(--radius-panel)] border shadow-[var(--shadow-panel)]"
        >
          {/* Header */}
          <div className="border-border bg-canvas/60 border-b p-4">
            <div className="flex items-center gap-2">
              <MdMenuBook className="text-accent size-5" />
              <h2 className="text-text truncate text-sm font-bold">
                Conteúdo do curso
              </h2>
            </div>
            <p className="text-text-muted mt-1 truncate text-xs">
              {course.title}
            </p>
          </div>

          {/* Curriculum List (Scrollable on desktop, fully accessible) */}
          <div className="divide-border/60 max-h-[600px] divide-y overflow-y-auto">
            {course.modules.map((moduleItem) => (
              <div key={moduleItem.id} className="py-2">
                <div className="text-text-muted px-4 py-1.5 text-[11px] font-bold tracking-wider uppercase">
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
                            <MdOutlinePlayCircleFilled className="text-accent size-4" />
                          ) : (
                            <MdCheckCircle className="text-border group-hover:text-text-muted size-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 leading-tight">
                            {courseLesson.title}
                          </p>
                          <span className="text-text-muted mt-1 block text-[10px]">
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

          {/* Bottom Link to Modules */}
          <div className="border-border bg-canvas/40 border-t p-3">
            <Link href="/aluno/home" className="w-full">
              <Button variant="secondary" size="sm" className="w-full text-xs">
                Ver todos os módulos
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
