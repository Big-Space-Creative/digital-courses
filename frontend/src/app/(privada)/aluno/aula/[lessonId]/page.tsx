import Link from "next/link";
import VideoPlayer from "@/components/ui/VideoPlayer";
import LessonTabs from "./LessonTabs";
import {
  MdAccessTime,
  MdArrowDownward,
  MdCheckCircle,
  MdCheckCircleOutline,
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="border-ink/10 bg-surface-soft rounded-bento-md w-full max-w-2xl border p-8 text-center">
          <h1 className="text-ink text-2xl font-bold">Aula indisponível</h1>
          <p className="text-ink/60 mt-2 text-sm">{result.error}</p>
          <Link
            href="/aluno/home"
            className="gradient-animate mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white"
            style={{ backgroundImage: "var(--gradient-pulse)" }}
          >
            Voltar para a trilha
          </Link>
        </div>
      </div>
    );
  }

  const lesson = result.data;
  const course = lesson.module.course;
  const currentModuleId = lesson.module.id;
  const resumo =
    lesson.description ||
    "Esta aula ainda não possui uma descrição detalhada cadastrada.";
  const dicas =
    lesson.module.description ||
    course.description ||
    "Siga a ordem das aulas e use os materiais complementares para fixar o conteúdo.";

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
    <div className="flex w-full flex-col gap-10">
      <div className="rounded-bento-md relative overflow-hidden">
        <div className="bg-ink w-2/3 p-6">
          <VideoPlayer lessonVideoUrl={lesson.video_url ?? ""} />
        </div>
        <div className="bg-ink absolute inset-y-0 right-0 flex min-h-0 w-1/3 flex-col overflow-hidden">
          <div className="bg-accent-ink px-6 py-4">
            <h1 className="font-bold text-white">Conteúdo do curso</h1>
            <p className="text-white/80">{course.title}</p>
          </div>
          <div className="[scrollbar-color:var(--color-accent)_transparent] [scrollbar-width:thin] flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--color-accent)]/80 [&::-webkit-scrollbar-thumb]:transition-colors [&::-webkit-scrollbar-thumb]:duration-200 hover:[&::-webkit-scrollbar-thumb]:bg-[var(--color-accent)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/10">
            {course.modules.map((moduleItem) => (
              <div key={moduleItem.id} className="mb-3">
                <div className="text-surface/40 px-4 py-2 text-xs font-bold tracking-[0.12em] uppercase">
                  {moduleItem.title}
                </div>

                {moduleItem.lessons.map((courseLesson) => {
                  const isCurrent = courseLesson.id === lesson.id;

                  return (
                    <Link
                      href={`/aluno/aula/${courseLesson.id}`}
                      key={courseLesson.id}
                      className={`group flex cursor-pointer gap-4 rounded-lg p-4 transition-all ${
                        isCurrent ? "bg-white/10" : "hover:bg-white/10"
                      }`}
                    >
                      <div
                        className={`flex size-16 items-center justify-center rounded-lg transition-all duration-500 group-hover:scale-110 ${
                          isCurrent
                            ? "bg-accent/25 text-accent-400"
                            : "bg-emerald-400/20 text-emerald-300"
                        }`}
                      >
                        <MdCheckCircle />
                      </div>
                      <div>
                        <h1
                          className={`text-xs font-bold transition-all duration-500 ${
                            isCurrent
                              ? "text-accent-400"
                              : "text-emerald-300 group-hover:text-emerald-200"
                          }`}
                        >
                          {isCurrent
                            ? "Atual"
                            : moduleItem.id === currentModuleId
                              ? "Disponível"
                              : "Próxima"}
                        </h1>
                        <p className="text-surface text-sm">
                          {courseLesson.title}
                        </p>
                        <span className="text-surface/50 text-xs">
                          {courseLesson.duration_in_minutes
                            ? `${courseLesson.duration_in_minutes} min`
                            : "Vídeo"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="bg-accent-ink px-6 py-4">
            <Link
              href="/aluno/home"
              className="flex w-full items-center justify-center gap-4 rounded-full bg-white/10 py-4 font-bold text-white transition-colors hover:bg-white/15"
            >
              <MdArrowDownward className="size-5 rotate-90" /> Voltar para os
              módulos
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="border-ink/15 flex items-start justify-between border-b pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="bg-accent/15 text-accent rounded-sm p-2 text-xs font-bold uppercase">
                {lesson.module.title}
              </p>
              <div className="text-ink/70 flex items-end gap-1">
                <MdAccessTime className="size-4" />
                <p className="text-xs">
                  {lesson.duration_in_minutes
                    ? `${lesson.duration_in_minutes} min`
                    : "Sem duração informada"}
                </p>
              </div>
            </div>
            <h1 className="text-ink text-3xl font-bold">{lesson.title}</h1>
            <p className="text-ink/70 text-base">{resumo}</p>
          </div>
          <button className="text-ink/40 flex cursor-default items-center gap-2 rounded-full bg-black/5 p-4 font-bold">
            <MdCheckCircleOutline className="size-6" />
            <p>Marcar como concluída</p>
          </button>
        </div>
        <div>
          <LessonTabs
            lessonId={lesson.id}
            resumo={resumo}
            dicas={dicas}
            materials={materials}
            comments={comments}
          />
        </div>
      </div>
    </div>
  );
}
