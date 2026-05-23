"use client";

import { type ChangeEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import type { LessonState, MaterialState, ModuleState } from "@/types/course";
import { toast } from "@/components/ui/Toast";
import {
  MdAddCircleOutline,
  MdArrowBack,
  MdDeleteOutline,
  MdOutlineCollections,
  MdOutlineImage,
  MdOutlineInfo,
  MdOutlineInsertDriveFile,
  MdOutlineOndemandVideo,
  MdOutlineSave,
  MdOutlineUploadFile,
} from "react-icons/md";

type ApiMaterial = {
  id: number;
  title: string;
  file_path: string;
  type: string;
};

type ApiLesson = {
  id: number;
  title: string;
  description: string | null;
  thumbnail?: string | null;
  video_url?: string | null;
  duration_in_minutes: number | null;
  is_free_preview: boolean;
  materials?: ApiMaterial[];
};

type ApiModule = {
  id: number;
  title: string;
  lessons: ApiLesson[];
};

type ApiCourse = {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  is_published: boolean;
  modules: ApiModule[];
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createLesson(): LessonState {
  return {
    id: createId(),
    title: "",
    description: "",
    durationMinutes: "",
    isFreePreview: false,
    videoFile: null,
    videoUrl: null,
    thumbnailFile: null,
    thumbnailUrl: null,
    materials: [],
  };
}

function createModule(): ModuleState {
  return {
    id: createId(),
    name: "Novo módulo",
    lessons: [createLesson()],
  };
}

type LessonEditorProps = {
  lesson: LessonState;
  lessonIndex: number;
  onUpdate: (updater: (lesson: LessonState) => LessonState) => void;
  onRemove: () => void;
};

function LessonEditor({ lesson, lessonIndex, onUpdate, onRemove }: LessonEditorProps) {
  const materialInputRef = useRef<HTMLInputElement>(null);

  function addMaterial(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const material: MaterialState = {
      id: createId(),
      title: file.name.replace(/\.[^.]+$/, ""),
      file,
      path: null,
      type: file.type || null,
    };

    onUpdate((current) => ({
      ...current,
      materials: [...current.materials, material],
    }));

    event.target.value = "";
  }

  function updateMaterial(
    materialId: string | number,
    updater: (material: MaterialState) => MaterialState,
  ) {
    onUpdate((current) => ({
      ...current,
      materials: current.materials.map((material) =>
        material.id === materialId ? updater(material) : material,
      ),
    }));
  }

  function removeMaterial(materialId: string | number) {
    onUpdate((current) => ({
      ...current,
      materials: current.materials.filter((material) => material.id !== materialId),
    }));
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-gray-400 uppercase">
            Aula {lessonIndex + 1}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Atualize tÃ­tulo, descriÃ§Ã£o, foto, vÃ­deo e materiais sempre que precisar.
          </p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <MdDeleteOutline size={18} />
          Remover aula
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">
          TÃ­tulo da aula
          <input
            value={lesson.title}
            onChange={(event) =>
              onUpdate((current) => ({ ...current, title: event.target.value }))
            }
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          DuraÃ§Ã£o em minutos
          <input
            type="number"
            min="1"
            value={lesson.durationMinutes}
            onChange={(event) =>
              onUpdate((current) => ({
                ...current,
                durationMinutes: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium text-gray-700">
        DescriÃ§Ã£o da aula
        <textarea
          rows={4}
          value={lesson.description}
          onChange={(event) =>
            onUpdate((current) => ({ ...current, description: event.target.value }))
          }
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
        />
      </label>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">
          Foto da aula
          <div className="mt-2 rounded-2xl border border-dashed border-orange-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
              <MdOutlineCollections size={18} />
              {lesson.thumbnailFile
                ? lesson.thumbnailFile.name
                : lesson.thumbnailUrl
                  ? "Foto atual cadastrada"
                  : "Nenhuma foto cadastrada"}
            </div>
            {lesson.thumbnailUrl && !lesson.thumbnailFile && (
              <img
                src={lesson.thumbnailUrl}
                alt={lesson.title}
                className="mb-3 h-32 w-full rounded-xl object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                onUpdate((current) => ({
                  ...current,
                  thumbnailFile: event.target.files?.[0] ?? null,
                }))
              }
              className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:font-medium file:text-orange-700"
            />
          </div>
        </label>

        <label className="block text-sm font-medium text-gray-700">
          VÃ­deo da aula
          <div className="mt-2 rounded-2xl border border-dashed border-orange-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
              <MdOutlineOndemandVideo size={18} />
              {lesson.videoFile
                ? lesson.videoFile.name
                : lesson.videoUrl
                  ? "VÃ­deo atual cadastrado"
                  : "Nenhum vÃ­deo cadastrado"}
            </div>
            {lesson.videoUrl && !lesson.videoFile && (
              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="mb-3 inline-flex text-sm font-medium text-orange-700 underline underline-offset-4"
              >
                Abrir vÃ­deo atual
              </a>
            )}
            <input
              type="file"
              accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
              onChange={(event) =>
                onUpdate((current) => ({
                  ...current,
                  videoFile: event.target.files?.[0] ?? null,
                }))
              }
              className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:font-medium file:text-orange-700"
            />
          </div>
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-orange-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Materiais da aula</p>
            <p className="mt-1 text-sm text-gray-500">
              Adicione PDFs, imagens e arquivos complementares para o aluno.
            </p>
          </div>
          <button
            type="button"
            onClick={() => materialInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-100"
          >
            <MdOutlineUploadFile size={18} />
            Adicionar material
          </button>
        </div>

        <input
          ref={materialInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,.avi,.mkv,.webm"
          className="hidden"
          onChange={addMaterial}
        />

        {lesson.materials.length > 0 ? (
          <div className="mt-4 space-y-3">
            {lesson.materials.map((material) => {
              const isExisting = Boolean(material.dbId);

              return (
                <div
                  key={material.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <MdOutlineInsertDriveFile
                      size={18}
                      className="mt-1 shrink-0 text-orange-500"
                    />
                    <div className="min-w-0 flex-1">
                      <input
                        value={material.title}
                        onChange={(event) =>
                          updateMaterial(material.id, (current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        className="w-full bg-transparent text-sm font-medium text-gray-800 outline-none"
                        placeholder="TÃ­tulo do material"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {material.file
                          ? `${material.file.name} • ${(material.file.size / 1024 / 1024).toFixed(1)} MB`
                          : isExisting
                            ? "Material jÃ¡ salvo nesta aula"
                            : "Material pronto para envio"}
                      </p>
                      {material.path && (
                        <a
                          href={material.path}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-xs font-medium text-orange-700 underline underline-offset-4"
                        >
                          Abrir material atual
                        </a>
                      )}
                    </div>
                    {!isExisting && (
                      <button
                        type="button"
                        onClick={() => removeMaterial(material.id)}
                        className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">Nenhum material cadastrado nesta aula.</p>
        )}
      </div>

      <button
        type="button"
        onClick={() =>
          onUpdate((current) => ({
            ...current,
            isFreePreview: !current.isFreePreview,
          }))
        }
        className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
          lesson.isFreePreview
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-gray-200 bg-white text-gray-600"
        }`}
      >
        {lesson.isFreePreview
          ? "Aula liberada como preview"
          : "Marcar aula como preview gratuito"}
      </button>
    </div>
  );
}

export default function EditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = Number(params.courseId);

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [courseThumbnailUrl, setCourseThumbnailUrl] = useState<string | null>(null);
  const [courseThumbnailFile, setCourseThumbnailFile] = useState<File | null>(null);
  const [modules, setModules] = useState<ModuleState[]>([]);
  const [removedModuleIds, setRemovedModuleIds] = useState<number[]>([]);
  const [removedLessonIds, setRemovedLessonIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let ignore = false;

    async function loadCourse() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Falha ao carregar curso");
        }

        if (ignore) return;

        const course = result.data as ApiCourse;
        setCourseTitle(course.title);
        setCourseDescription(course.description ?? "");
        setIsPublished(course.is_published);
        setCourseThumbnailUrl(course.thumbnail);
        setModules(
          course.modules.map((apiModule) => ({
            id: createId(),
            dbId: apiModule.id,
            name: apiModule.title,
            lessons: apiModule.lessons.map((lesson) => ({
              id: createId(),
              dbId: lesson.id,
              title: lesson.title,
              description: lesson.description ?? "",
              durationMinutes: lesson.duration_in_minutes
                ? String(lesson.duration_in_minutes)
                : "",
              isFreePreview: lesson.is_free_preview,
              videoFile: null,
              videoUrl: lesson.video_url ?? null,
              thumbnailFile: null,
              thumbnailUrl: lesson.thumbnail ?? null,
              materials: [],
            })),
          })),
        );
      } catch (error) {
        toast("Erro ao carregar curso", {
          description: error instanceof Error ? error.message : "Tente novamente.",
          variant: "error",
        });
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadCourse();

    return () => {
      ignore = true;
    };
  }, [courseId]);

  const totalLessons = useMemo(
    () => modules.reduce((count, moduleItem) => count + moduleItem.lessons.length, 0),
    [modules],
  );

  function updateModule(
    moduleId: string | number,
    updater: (moduleItem: ModuleState) => ModuleState,
  ) {
    setModules((current) =>
      current.map((moduleItem) =>
        moduleItem.id === moduleId ? updater(moduleItem) : moduleItem,
      ),
    );
  }

  function updateLesson(
    moduleId: string | number,
    lessonId: string | number,
    updater: (lesson: LessonState) => LessonState,
  ) {
    updateModule(moduleId, (moduleItem) => ({
      ...moduleItem,
      lessons: moduleItem.lessons.map((lesson) =>
        lesson.id === lessonId ? updater(lesson) : lesson,
      ),
    }));
  }

  function addModule() {
    setModules((current) => [...current, createModule()]);
  }

  function removeModule(moduleId: string | number) {
    setModules((current) => {
      const targetModule = current.find((item) => item.id === moduleId);
      if (!targetModule) return current;

      if (targetModule.dbId) {
        setRemovedModuleIds((ids) => [...ids, targetModule.dbId!]);
      }

      targetModule.lessons.forEach((lesson) => {
        if (lesson.dbId) {
          setRemovedLessonIds((ids) => [...ids, lesson.dbId!]);
        }
      });

      return current.filter((item) => item.id !== moduleId);
    });
  }

  function addLesson(moduleId: string | number) {
    updateModule(moduleId, (moduleItem) => ({
      ...moduleItem,
      lessons: [...moduleItem.lessons, createLesson()],
    }));
  }

  function removeLesson(moduleId: string | number, lessonId: string | number) {
    updateModule(moduleId, (moduleItem) => {
      const targetLesson = moduleItem.lessons.find((item) => item.id === lessonId);
      if (targetLesson?.dbId) {
        setRemovedLessonIds((ids) => [...ids, targetLesson.dbId!]);
      }

      return {
        ...moduleItem,
        lessons: moduleItem.lessons.filter((item) => item.id !== lessonId),
      };
    });
  }

  async function uploadDirectlyToS3(file: File): Promise<string> {
    const response = await fetch("/api/admin/courses/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, content_type: file.type }),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Erro ao gerar URL de upload");
    }

    const putResponse = await fetch(data.upload_url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!putResponse.ok) {
      throw new Error(`Falha no upload do arquivo: ${putResponse.status}`);
    }

    return data.path as string;
  }

  function validateBeforeSubmit() {
    if (!courseTitle.trim()) {
      throw new Error("Informe o título do curso.");
    }

    if (modules.length === 0) {
      throw new Error("Adicione pelo menos um módulo.");
    }

    for (const moduleItem of modules) {
      if (!moduleItem.name.trim()) {
        throw new Error("Todo módulo precisa ter um título.");
      }

      if (moduleItem.lessons.length === 0) {
        throw new Error(`O módulo "${moduleItem.name}" precisa ter ao menos uma aula.`);
      }

      for (const lesson of moduleItem.lessons) {
        if (!lesson.title.trim()) {
          throw new Error("Toda aula precisa ter um título.");
        }

        if (!lesson.videoUrl && !lesson.videoFile) {
          throw new Error(`A aula "${lesson.title}" precisa ter um vídeo.`);
        }
      }
    }
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        validateBeforeSubmit();
        toast("Salvando alterações...", {
          description: "Enviando conteúdo e atualizando a estrutura do curso.",
          variant: "info",
        });

        const formData = new FormData();
        formData.append("courseTitle", courseTitle.trim());
        formData.append("courseDescription", courseDescription.trim());
        formData.append("isPublished", isPublished ? "1" : "0");
        formData.append("removedModuleIds", JSON.stringify(removedModuleIds));
        formData.append("removedLessonIds", JSON.stringify(removedLessonIds));

        if (courseThumbnailFile) {
          formData.append("thumbnailFile", courseThumbnailFile);
        }

        const modulesPayload = [];

        for (const moduleItem of modules) {
          const lessonsPayload = [];

          for (const lesson of moduleItem.lessons) {
            let uploadedVideoPath: string | null = null;

            if (lesson.videoFile) {
              toast(`Enviando vídeo da aula "${lesson.title}"`, {
                variant: "info",
              });
              uploadedVideoPath = await uploadDirectlyToS3(lesson.videoFile);
              formData.append(`video_path_${lesson.id}`, uploadedVideoPath);
            }

            if (lesson.thumbnailFile) {
              formData.append(`lesson_thumbnail_${lesson.id}`, lesson.thumbnailFile);
            }

            lessonsPayload.push({
              id: lesson.id,
              dbId: lesson.dbId,
              title: lesson.title,
              description: lesson.description,
              durationMinutes: lesson.durationMinutes,
              isFreePreview: lesson.isFreePreview,
              videoUrl: uploadedVideoPath ? null : lesson.videoUrl ?? null,
              thumbnailUrl: lesson.thumbnailUrl ?? null,
              materials: lesson.materials || [],
            });
          }

          modulesPayload.push({
            id: moduleItem.id,
            dbId: moduleItem.dbId,
            name: moduleItem.name,
            lessons: lessonsPayload,
          });
        }

        formData.append("modules", JSON.stringify(modulesPayload));

        const response = await fetch(`/api/admin/courses/${courseId}`, {
          method: "PUT",
          body: formData,
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Falha ao salvar o curso");
        }

        toast("Curso atualizado com sucesso!", {
          description: "As alterações já estão disponíveis no painel.",
          variant: "success",
        });

        router.push("/admin/cursos/gerenciar");
      } catch (error) {
        toast("Erro ao salvar curso", {
          description: error instanceof Error ? error.message : "Tente novamente.",
          variant: "error",
        });
      }
    });
  }

  if (loading) {
    return (
      <div className="bg-background min-h-screen p-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">Carregando editor do curso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => router.push("/admin/cursos/gerenciar")}
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <MdArrowBack size={16} />
                Voltar para gerenciamento
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Editar curso</h1>
              <p className="mt-1 text-sm text-gray-500">
                Atualize o curso, crie novos módulos e ajuste as aulas quando precisar.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-primary hover:bg-primary-dark inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
            >
              <MdOutlineSave size={18} />
              {isPending ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MdOutlineInfo size={18} className="text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Dados do curso</h2>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Título do curso
                <input
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Descrição
                <textarea
                  rows={5}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Capa do curso
                <div className="mt-2 rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                    <MdOutlineImage size={18} />
                    {courseThumbnailFile
                      ? courseThumbnailFile.name
                      : courseThumbnailUrl
                        ? "Capa atual cadastrada"
                        : "Nenhuma capa cadastrada"}
                  </div>
                  {courseThumbnailUrl && !courseThumbnailFile && (
                    <img
                      src={courseThumbnailUrl}
                      alt="Capa do curso"
                      className="mb-3 h-40 w-full rounded-xl object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCourseThumbnailFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:font-medium file:text-orange-700"
                  />
                </div>
              </label>

              <button
                type="button"
                onClick={() => setIsPublished((current) => !current)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium ${
                  isPublished
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                {isPublished
                  ? "Curso publicado para alunos"
                  : "Curso salvo como rascunho"}
              </button>
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Resumo</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold tracking-[0.12em] text-gray-400 uppercase">
                  Módulos
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{modules.length}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold tracking-[0.12em] text-gray-400 uppercase">
                  Aulas
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{totalLessons}</p>
              </div>
              <button
                type="button"
                onClick={addModule}
                className="text-primary inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 font-semibold hover:bg-orange-100"
              >
                <MdAddCircleOutline size={18} />
                Adicionar módulo
              </button>
            </div>
          </article>
        </section>

        <section className="space-y-6">
          {modules.map((moduleItem, moduleIndex) => (
            <article
              key={moduleItem.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-primary mb-2 text-xs font-bold tracking-[0.15em] uppercase">
                    Módulo {moduleIndex + 1}
                  </p>
                  <input
                    value={moduleItem.name}
                    onChange={(e) =>
                      updateModule(moduleItem.id, (current) => ({
                        ...current,
                        name: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium outline-none focus:border-orange-300"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeModule(moduleItem.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <MdDeleteOutline size={18} />
                  Remover módulo
                </button>
              </div>

              <div className="space-y-4">
                {moduleItem.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                  >
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.12em] text-gray-400 uppercase">
                          Aula {lessonIndex + 1}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Atualize título, descrição, foto e vídeo sempre que precisar.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLesson(moduleItem.id, lesson.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <MdDeleteOutline size={18} />
                        Remover aula
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Título da aula
                        <input
                          value={lesson.title}
                          onChange={(e) =>
                            updateLesson(moduleItem.id, lesson.id, (current) => ({
                              ...current,
                              title: e.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                        />
                      </label>

                      <label className="block text-sm font-medium text-gray-700">
                        Duração em minutos
                        <input
                          type="number"
                          min="1"
                          value={lesson.durationMinutes}
                          onChange={(e) =>
                            updateLesson(moduleItem.id, lesson.id, (current) => ({
                              ...current,
                              durationMinutes: e.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                        />
                      </label>
                    </div>

                    <label className="mt-4 block text-sm font-medium text-gray-700">
                      Descrição da aula
                      <textarea
                        rows={4}
                        value={lesson.description}
                        onChange={(e) =>
                          updateLesson(moduleItem.id, lesson.id, (current) => ({
                            ...current,
                            description: e.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                      />
                    </label>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Foto da aula
                        <div className="mt-2 rounded-2xl border border-dashed border-orange-200 bg-white p-4">
                          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                            <MdOutlineCollections size={18} />
                            {lesson.thumbnailFile
                              ? lesson.thumbnailFile.name
                              : lesson.thumbnailUrl
                                ? "Foto atual cadastrada"
                                : "Nenhuma foto cadastrada"}
                          </div>
                          {lesson.thumbnailUrl && !lesson.thumbnailFile && (
                            <img
                              src={lesson.thumbnailUrl}
                              alt={lesson.title}
                              className="mb-3 h-32 w-full rounded-xl object-cover"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              updateLesson(moduleItem.id, lesson.id, (current) => ({
                                ...current,
                                thumbnailFile: e.target.files?.[0] ?? null,
                              }))
                            }
                            className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:font-medium file:text-orange-700"
                          />
                        </div>
                      </label>

                      <label className="block text-sm font-medium text-gray-700">
                        Vídeo da aula
                        <div className="mt-2 rounded-2xl border border-dashed border-orange-200 bg-white p-4">
                          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                            <MdOutlineOndemandVideo size={18} />
                            {lesson.videoFile
                              ? lesson.videoFile.name
                              : lesson.videoUrl
                                ? "Vídeo atual cadastrado"
                                : "Nenhum vídeo cadastrado"}
                          </div>
                          {lesson.videoUrl && !lesson.videoFile && (
                            <a
                              href={lesson.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mb-3 inline-flex text-sm font-medium text-orange-700 underline underline-offset-4"
                            >
                              Abrir vídeo atual
                            </a>
                          )}
                          <input
                            type="file"
                            accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
                            onChange={(e) =>
                              updateLesson(moduleItem.id, lesson.id, (current) => ({
                                ...current,
                                videoFile: e.target.files?.[0] ?? null,
                              }))
                            }
                            className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:font-medium file:text-orange-700"
                          />
                        </div>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateLesson(moduleItem.id, lesson.id, (current) => ({
                          ...current,
                          isFreePreview: !current.isFreePreview,
                        }))
                      }
                      className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                        lesson.isFreePreview
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      {lesson.isFreePreview
                        ? "Aula liberada como preview"
                        : "Marcar aula como preview gratuito"}
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addLesson(moduleItem.id)}
                className="text-primary mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold hover:bg-orange-100"
              >
                <MdAddCircleOutline size={18} />
                Adicionar aula
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
