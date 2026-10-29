"use client";
import Image from "next/image";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  EditorStatus,
  editorSnapshot,
  useUnsavedChanges,
} from "../../../components/EditorStatus";
import { ErrorState } from "@/components/ui/ErrorState";
import { Dialog } from "@/components/ui/Dialog";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import { Checkbox } from "@/components/ui/Checkbox";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
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
  submitted: boolean;
  lesson: LessonState;
  lessonIndex: number;
  onUpdate: (updater: (lesson: LessonState) => LessonState) => void;
  onRemove: () => void;
};

function LessonEditor({
  submitted,
  lesson,
  lessonIndex,
  onUpdate,
  onRemove,
}: LessonEditorProps) {
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
      materials: current.materials.filter(
        (material) => material.id !== materialId,
      ),
    }));
  }

  return (
    <div className="rounded-bento-sm bg-canvas ring-border p-5 ring-1">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-text-muted text-sm font-medium">
            Aula {lessonIndex + 1}
          </p>
          <p className="text-text-muted mt-1 text-sm">
            Atualize título, descrição, foto, vídeo e materiais sempre que
            precisar.
          </p>
        </div>

        <Button variant="danger" type="button" onClick={onRemove}>
          <MdDeleteOutline size={18} />
          Remover aula
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Título da aula"
          error={
            submitted && !lesson.title.trim()
              ? "Informe o título da aula."
              : undefined
          }
          value={lesson.title}
          onChange={(event) =>
            onUpdate((current) => ({ ...current, title: event.target.value }))
          }
        />

        <Input
          label="Duração em minutos"
          type="number"
          min="1"
          value={lesson.durationMinutes}
          onChange={(event) =>
            onUpdate((current) => ({
              ...current,
              durationMinutes: event.target.value,
            }))
          }
        />
      </div>

      <Textarea
        label="Descrição da aula"
        rows={4}
        value={lesson.description}
        onChange={(event) =>
          onUpdate((current) => ({
            ...current,
            description: event.target.value,
          }))
        }
      />

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="text-text-muted block text-sm font-medium">
          Foto da aula
          <div className="rounded-bento-md border-accent/40 mt-2 border border-dashed bg-white p-4">
            <div className="text-text-muted mb-3 flex items-center gap-2 text-sm">
              <MdOutlineCollections size={18} />
              {lesson.thumbnailFile
                ? lesson.thumbnailFile.name
                : lesson.thumbnailUrl
                  ? "Foto atual cadastrada"
                  : "Nenhuma foto cadastrada"}
            </div>
            {lesson.thumbnailUrl && !lesson.thumbnailFile && (
              <Image
                unoptimized
                width={320}
                height={180}
                src={lesson.thumbnailUrl}
                alt={lesson.title}
                className="mb-3 h-32 w-full rounded-xl object-cover"
              />
            )}
            <Input
              label="Imagem"
              type="file"
              accept="image/*"
              onChange={(event) =>
                onUpdate((current) => ({
                  ...current,
                  thumbnailFile: event.target.files?.[0] ?? null,
                }))
              }
            />
          </div>
        </div>

        <div className="text-text-muted block text-sm font-medium">
          Vídeo da aula
          <div className="rounded-bento-md border-accent/40 mt-2 border border-dashed bg-white p-4">
            <div className="text-text-muted mb-3 flex items-center gap-2 text-sm">
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
                className="text-accent-text mb-3 inline-flex text-sm font-medium underline underline-offset-4"
              >
                Abrir vídeo atual
              </a>
            )}
            <Input
              label="Vídeo da aula"
              type="file"
              accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
              onChange={(event) =>
                onUpdate((current) => ({
                  ...current,
                  videoFile: event.target.files?.[0] ?? null,
                }))
              }
              error={
                submitted &&
                !lesson.videoFile &&
                !lesson.videoUrl &&
                !lesson.videoPath
                  ? "Selecione o vídeo da aula."
                  : undefined
              }
            />
          </div>
        </div>
      </div>

      <div className="rounded-bento-md border-accent/40 mt-4 border border-dashed bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-text-muted text-sm font-medium">
              Materiais da aula
            </p>
            <p className="text-text-muted mt-1 text-sm">
              Adicione PDFs, imagens e arquivos complementares para o aluno.
            </p>
          </div>
          <Button
            variant="secondary"
            type="button"
            onClick={() => materialInputRef.current?.click()}
          >
            <MdOutlineUploadFile size={18} />
            Adicionar material
          </Button>
        </div>

        <Input
          label="Arquivo do material"
          ref={materialInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,.avi,.mkv,.webm"
          onChange={addMaterial}
        />

        {lesson.materials.length > 0 ? (
          <div className="mt-4 space-y-3">
            {lesson.materials.map((material) => {
              const isExisting = Boolean(material.dbId);

              return (
                <div
                  key={material.id}
                  className="border-border bg-canvas rounded-xl border px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <MdOutlineInsertDriveFile
                      size={18}
                      className="text-accent-text mt-1 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <Input
                        label="Título do material"
                        value={material.title}
                        onChange={(event) =>
                          updateMaterial(material.id, (current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        placeholder="Título do material"
                      />
                      <p className="text-text-muted mt-1 text-xs">
                        {material.file
                          ? `${material.file.name} • ${(material.file.size / 1024 / 1024).toFixed(1)} MB`
                          : isExisting
                            ? "Material já salvo nesta aula"
                            : "Material pronto para envio"}
                      </p>
                      {material.path && (
                        <a
                          href={material.path}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent-text mt-2 inline-flex text-xs font-medium underline underline-offset-4"
                        >
                          Abrir material atual
                        </a>
                      )}
                    </div>
                    {!isExisting && (
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => removeMaterial(material.id)}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-text-muted mt-4 text-sm">
            Nenhum material cadastrado nesta aula.
          </p>
        )}
      </div>

      <Checkbox
        label="Prévia gratuita da aula"
        checked={lesson.isFreePreview}
        onChange={() =>
          onUpdate((current) => ({
            ...current,
            isFreePreview: !current.isFreePreview,
          }))
        }
      />
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
  const [courseThumbnailUrl, setCourseThumbnailUrl] = useState<string | null>(
    null,
  );
  const [courseThumbnailFile, setCourseThumbnailFile] = useState<File | null>(
    null,
  );
  const [modules, setModules] = useState<ModuleState[]>([]);
  const [removedModuleIds, setRemovedModuleIds] = useState<number[]>([]);
  const [removedLessonIds, setRemovedLessonIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const cancelLeaveRef = useRef<HTMLButtonElement>(null);
  const editorRef = useRef<HTMLFieldSetElement>(null);
  const submitLock = useRef(false);
  const [loadError, setLoadError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    moduleId: string | number;
    lessonId?: string | number;
    label: string;
  } | null>(null);

  const { dirty, markSaved } = useUnsavedChanges(
    editorSnapshot({
      courseTitle,
      courseDescription,
      isPublished,
      modules,
      thumbnail: courseThumbnailFile,
    }),
    !loading && !loadError,
  );
  function requestLeave() {
    if (dirty) setLeaveOpen(true);
    else router.push("/admin/cursos/gerenciar");
  }
  function validateEditor() {
    setSubmitted(true);
    setSaveError("");
    const messages: string[] = [];
    if (!courseTitle.trim()) messages.push("Informe o título do curso.");
    if (!modules.length) messages.push("Adicione pelo menos um módulo.");
    modules.forEach((moduleItem, index) => {
      if (!moduleItem.name.trim())
        messages.push(`Informe o nome do módulo ${index + 1}.`);
      if (!moduleItem.lessons.length)
        messages.push(`Adicione uma aula ao módulo ${index + 1}.`);
      moduleItem.lessons.forEach((lesson, lessonIndex) => {
        if (!lesson.title.trim())
          messages.push(
            `Informe o título da aula ${lessonIndex + 1} do módulo ${index + 1}.`,
          );
        if (!lesson.videoFile && !lesson.videoUrl && !lesson.videoPath)
          messages.push(
            `Selecione o vídeo da aula ${lessonIndex + 1} do módulo ${index + 1}.`,
          );
        if (
          lesson.durationMinutes &&
          (!Number.isFinite(Number(lesson.durationMinutes)) ||
            Number(lesson.durationMinutes) < 1)
        )
          messages.push("A duração deve ser maior que zero.");
      });
    });
    if (messages.length) {
      setSaveError(messages.join(" "));
      requestAnimationFrame(() =>
        editorRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return false;
    }
    return true;
  }

  useEffect(() => {
    let ignore = false;

    async function loadCourse() {
      try {
        setLoading(true);
        setLoadError("");
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
              materials: (lesson.materials ?? []).map((material) => ({
                id: createId(),
                dbId: material.id,
                title: material.title,
                file: null,
                path: material.file_path,
                type: material.type,
              })),
            })),
          })),
        );
      } catch (error) {
        if (ignore) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o curso.",
        );
        toast("Erro ao carregar curso", {
          description:
            error instanceof Error ? error.message : "Tente novamente.",
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
    () =>
      modules.reduce(
        (count, moduleItem) => count + moduleItem.lessons.length,
        0,
      ),
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
      const targetLesson = moduleItem.lessons.find(
        (item) => item.id === lessonId,
      );
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
    setUploadStatus(`Enviando ${file.name}…`);
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
        throw new Error(
          `O módulo "${moduleItem.name}" precisa ter ao menos uma aula.`,
        );
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
    if (
      loading ||
      loadError ||
      isPending ||
      submitLock.current ||
      !validateEditor()
    )
      return;
    submitLock.current = true;
    startTransition(async () => {
      try {
        validateBeforeSubmit();
        setUploadStatus("Preparando arquivos…");
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
              formData.append(
                `lesson_thumbnail_${lesson.id}`,
                lesson.thumbnailFile,
              );
            }

            for (const material of lesson.materials) {
              if (material.file) {
                formData.append(
                  `lesson_material_${lesson.id}_${material.id}`,
                  material.file,
                );
              }
            }
            lessonsPayload.push({
              id: lesson.id,
              dbId: lesson.dbId,
              title: lesson.title,
              description: lesson.description,
              durationMinutes: lesson.durationMinutes,
              isFreePreview: lesson.isFreePreview,
              videoUrl: uploadedVideoPath ? null : (lesson.videoUrl ?? null),
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

        setUploadStatus("Arquivos enviados. Salvando a estrutura do curso…");
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
        setSaveError(
          error instanceof Error
            ? error.message
            : "Não foi possível salvar o curso.",
        );
        setUploadStatus(
          "O envio não foi concluído. Revise o erro e tente novamente.",
        );
        toast("Erro ao salvar curso", {
          description:
            error instanceof Error ? error.message : "Tente novamente.",
          variant: "error",
        });
      } finally {
        submitLock.current = false;
      }
    });
  }

  if (loadError)
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <h1 className="mb-6 text-2xl font-semibold">Editar curso</h1>
        <ErrorState
          title="Não foi possível abrir o editor"
          description={loadError}
          onRetry={() => window.location.reload()}
        />
        <Button
          variant="secondary"
          onClick={() => router.push("/admin/cursos/gerenciar")}
        >
          Voltar aos cursos
        </Button>
      </div>
    );

  if (loading) {
    return (
      <div className="bg-canvas min-h-screen p-8">
        <div
          aria-busy="true"
          className="rounded-bento-md bg-panel ring-border mx-auto max-w-6xl space-y-4 p-8 ring-1"
        >
          <h1 className="text-2xl font-semibold">Editar curso</h1>
          <p className="text-text-muted text-sm">
            Carregando editor do curso...
          </p>
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <fieldset
          ref={editorRef}
          disabled={isPending}
          className="min-w-0 space-y-6 border-0 p-0"
        >
          <section className="border-border bg-panel sticky top-[69px] z-20 rounded-2xl border p-4 lg:top-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={requestLeave}
                >
                  <MdArrowBack size={16} />
                  Voltar para gerenciamento
                </Button>
                <h1 className="text-text text-2xl font-semibold">
                  Editar curso
                </h1>
                <EditorStatus
                  dirty={dirty}
                  upload={uploadStatus}
                  error={saveError}
                />
                <p className="text-text-muted mt-1 text-sm">
                  Atualize o curso, crie novos módulos e ajuste as aulas quando
                  precisar.
                </p>
              </div>

              <Button
                variant="primary"
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
              >
                <MdOutlineSave size={18} />
                {isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-bento-md bg-panel ring-border p-6 ring-1">
              <div className="mb-4 flex items-center gap-2">
                <MdOutlineInfo size={18} className="text-accent-text" />
                <h2 className="text-text text-lg font-semibold">
                  Dados do curso
                </h2>
              </div>

              <div className="space-y-4">
                <Input
                  label="Título do curso"
                  error={
                    submitted && !courseTitle.trim()
                      ? "Informe o título do curso."
                      : undefined
                  }
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />

                <Textarea
                  label="Descrição"
                  rows={5}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                />

                <div className="text-text-muted block text-sm font-medium">
                  Capa do curso
                  <div className="rounded-bento-md border-accent/40 bg-accent/5 mt-2 border border-dashed p-4">
                    <div className="text-text-muted mb-3 flex items-center gap-2 text-sm">
                      <MdOutlineImage size={18} />
                      {courseThumbnailFile
                        ? courseThumbnailFile.name
                        : courseThumbnailUrl
                          ? "Capa atual cadastrada"
                          : "Nenhuma capa cadastrada"}
                    </div>
                    {courseThumbnailUrl && !courseThumbnailFile && (
                      <Image
                        unoptimized
                        width={320}
                        height={180}
                        src={courseThumbnailUrl}
                        alt="Capa do curso"
                        className="mb-3 h-40 w-full rounded-xl object-cover"
                      />
                    )}
                    <Input
                      label="Imagem"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setCourseThumbnailFile(e.target.files?.[0] ?? null)
                      }
                    />
                  </div>
                </div>

                <Checkbox
                  label="Exibido na área do aluno"
                  checked={isPublished}
                  onChange={() => setIsPublished((current) => !current)}
                />
              </div>
            </article>

            <article className="rounded-bento-md bg-panel ring-border p-6 ring-1">
              <h2 className="text-text text-lg font-semibold">Resumo</h2>
              <div className="text-text-muted mt-4 space-y-3 text-sm">
                <div className="rounded-bento-sm bg-canvas p-4">
                  <p className="text-text-muted text-sm font-medium">Módulos</p>
                  <p className="text-text mt-1 text-2xl font-semibold">
                    {modules.length}
                  </p>
                </div>
                <div className="rounded-bento-sm bg-canvas p-4">
                  <p className="text-text-muted text-sm font-medium">Aulas</p>
                  <p className="text-text mt-1 text-2xl font-semibold">
                    {totalLessons}
                  </p>
                </div>
                <Button variant="secondary" type="button" onClick={addModule}>
                  <MdAddCircleOutline size={18} />
                  Adicionar módulo
                </Button>
              </div>
            </article>
          </section>

          <section className="space-y-6">
            {modules.map((moduleItem, moduleIndex) => (
              <article
                key={moduleItem.id}
                className="rounded-bento-md bg-panel ring-border p-6 ring-1"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-accent-text mb-2 text-sm font-semibold">
                      Módulo {moduleIndex + 1}
                    </p>
                    <Input
                      label="Nome do módulo"
                      error={
                        submitted && !moduleItem.name.trim()
                          ? "Informe o nome do módulo."
                          : undefined
                      }
                      value={moduleItem.name}
                      onChange={(e) =>
                        updateModule(moduleItem.id, (current) => ({
                          ...current,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        moduleId: moduleItem.id,
                        label: `Módulo: ${moduleItem.name}`,
                      })
                    }
                  >
                    <MdDeleteOutline size={18} />
                    Remover módulo
                  </Button>
                </div>

                <div className="space-y-4">
                  {moduleItem.lessons.map((lesson, lessonIndex) => (
                    <LessonEditor
                      key={lesson.id}
                      submitted={submitted}
                      lesson={lesson}
                      lessonIndex={lessonIndex}
                      onUpdate={(updater) =>
                        updateLesson(moduleItem.id, lesson.id, updater)
                      }
                      onRemove={() =>
                        setDeleteTarget({
                          moduleId: moduleItem.id,
                          lessonId: lesson.id,
                          label: `Aula: ${lesson.title || `Aula ${lessonIndex + 1}`}`,
                        })
                      }
                    />
                  ))}
                </div>

                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => addLesson(moduleItem.id)}
                >
                  <MdAddCircleOutline size={18} />
                  Adicionar aula
                </Button>
              </article>
            ))}
          </section>
        </fieldset>
      </div>
      <DeleteConfirmModal
        open={!!deleteTarget}
        label={deleteTarget?.label ?? ""}
        title="Remover da estrutura"
        description="O item será removido da estrutura. Salve o curso para aplicar a alteração."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.lessonId !== undefined)
            removeLesson(deleteTarget.moduleId, deleteTarget.lessonId);
          else removeModule(deleteTarget.moduleId);
          setDeleteTarget(null);
        }}
      />
      <Dialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="Descartar alterações?"
        description="As alterações que ainda não foram salvas serão perdidas."
        initialFocusRef={cancelLeaveRef}
      >
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            ref={cancelLeaveRef}
            variant="secondary"
            onClick={() => setLeaveOpen(false)}
          >
            Continuar editando
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              markSaved();
              router.push("/admin/cursos/gerenciar");
            }}
          >
            Descartar alterações
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
