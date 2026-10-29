"use client";
import {
  EditorStatus,
  editorSnapshot,
  useUnsavedChanges,
} from "../../components/EditorStatus";
import { Dialog } from "@/components/ui/Dialog";
import { Checkbox } from "@/components/ui/Checkbox";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import {
  type ChangeEvent,
  type FormEvent,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import ModuleNameModal from "../../components/ModuleNameModal";
import { toast } from "@/components/ui/Toast";
import type { LessonState, MaterialState, ModuleState } from "@/types/course";
import {
  MdClose,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdKeyboardArrowUp,
  MdOutlineAdd,
  MdOutlineDelete,
  MdOutlineDragIndicator,
  MdOutlineImage,
  MdOutlineInfo,
  MdOutlineInsertDriveFile,
  MdOutlineUploadFile,
  MdOutlineVideocam,
} from "react-icons/md";

function moveItem<T>(array: T[], fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= array.length) return array;
  const newArray = [...array];
  const [movedItem] = newArray.splice(fromIndex, 1);
  if (!movedItem) return array;
  newArray.splice(toIndex, 0, movedItem);
  return newArray;
}

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
    materials: [],
  };
}

type LessonCardProps = {
  submitted: boolean;
  lesson: LessonState;
  lessonNumber: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onChange: (updated: LessonState) => void;
};

function LessonCard({
  submitted,
  lesson,
  lessonNumber,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDelete,
  onChange,
}: LessonCardProps) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const matInputRef = useRef<HTMLInputElement>(null);

  function handleVideoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onChange({ ...lesson, videoFile: file });
  }

  function handleAddMaterial(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const newMat: MaterialState = {
      id: createId(),
      title: file.name.replace(/\.[^.]+$/, ""),
      file,
    };

    onChange({ ...lesson, materials: [...lesson.materials, newMat] });
    e.target.value = "";
  }

  function handleRemoveMaterial(matId: string | number) {
    onChange({
      ...lesson,
      materials: lesson.materials.filter((m) => m.id !== matId),
    });
  }

  function handleMatTitleChange(matId: string | number, newTitle: string) {
    onChange({
      ...lesson,
      materials: lesson.materials.map((m) =>
        m.id === matId ? { ...m, title: newTitle } : m,
      ),
    });
  }

  return (
    <article className="rounded-bento-sm ring-border bg-white p-5 ring-1">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="text-text-muted flex items-center gap-2 text-sm font-semibold">
          <MdOutlineInfo className="text-accent-text" size={16} />
          Aula {String(lessonNumber).padStart(2, "0")}
        </div>

        <div className="text-text-muted flex items-center gap-1">
          <Button
            variant="secondary"
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={`Mover aula ${lessonNumber} para cima`}
          >
            <MdKeyboardArrowUp size={18} />
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={`Mover aula ${lessonNumber} para baixo`}
          >
            <MdKeyboardArrowDown size={18} />
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={onDelete}
            aria-label={`Apagar aula ${lessonNumber}`}
          >
            <MdOutlineDelete size={17} />
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Título da aula"
          error={
            submitted && !lesson.title.trim()
              ? "Informe o título da aula."
              : undefined
          }
          value={lesson.title}
          onChange={(e) => onChange({ ...lesson, title: e.target.value })}
          placeholder="Ex: Conhecendo as partes da guitarra"
          required
        />

        <Input
          label="Duração (minutos)"
          type="number"
          min="1"
          value={lesson.durationMinutes}
          onChange={(e) =>
            onChange({ ...lesson, durationMinutes: e.target.value })
          }
          placeholder="Ex: 15"
        />
      </div>

      <Textarea
        label="Resumo da aula"
        rows={3}
        value={lesson.description}
        onChange={(e) => onChange({ ...lesson, description: e.target.value })}
        placeholder="Descreva o que o aluno aprenderá nesta aula..."
      />

      <Checkbox
        label="Prévia gratuita da aula"
        checked={lesson.isFreePreview}
        onChange={() =>
          onChange({ ...lesson, isFreePreview: !lesson.isFreePreview })
        }
      />

      <div className="mt-4">
        <p className="text-text-muted text-sm font-medium">Vídeo da aula *</p>

        {lesson.videoFile ? (
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <MdOutlineVideocam size={18} className="shrink-0 text-green-600" />
            <span className="text-success flex-1 truncate text-sm">
              {lesson.videoFile.name}
            </span>
            <span className="text-success shrink-0 text-xs">
              ({(lesson.videoFile.size / 1024 / 1024).toFixed(1)} MB)
            </span>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                onChange({ ...lesson, videoFile: null });
                if (videoInputRef.current) videoInputRef.current.value = "";
              }}
              aria-label="Remover vídeo"
            >
              <MdClose size={16} />
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            type="button"
            onClick={() => videoInputRef.current?.click()}
          >
            <MdOutlineUploadFile
              className="text-text-muted mx-auto"
              size={22}
            />
            <p className="text-text-muted mt-2 text-xs font-medium normal-case">
              Clique para selecionar o arquivo de vídeo
            </p>
            <p className="text-text-muted mt-1 text-xs normal-case">
              MP4, MOV, AVI, MKV, WebM
            </p>
          </Button>
        )}

        <Input
          label="Vídeo da aula"
          ref={videoInputRef}
          type="file"
          accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
          onChange={handleVideoChange}
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

      <div className="mt-4">
        <p className="text-text-muted text-sm font-medium">
          Materiais de referência
        </p>

        {lesson.materials.length > 0 && (
          <div className="mt-2 space-y-2">
            {lesson.materials.map((mat) => (
              <div
                key={mat.id}
                className="border-border bg-canvas flex items-center gap-2 rounded-lg border px-3 py-2"
              >
                <MdOutlineInsertDriveFile
                  size={16}
                  className="text-accent-text shrink-0"
                />
                <Input
                  label="Título do material"
                  value={mat.title}
                  onChange={(e) => handleMatTitleChange(mat.id, e.target.value)}
                  placeholder="Título do material"
                />
                <span className="text-text-muted shrink-0 text-xs">
                  {mat.file && `(${(mat.file.size / 1024).toFixed(0)} KB)`}
                </span>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => handleRemoveMaterial(mat.id)}
                  aria-label="Remover material"
                >
                  <MdClose size={15} />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          type="button"
          onClick={() => matInputRef.current?.click()}
        >
          <MdOutlineAdd size={16} className="text-accent-text" />
          Adicionar material (PDF, imagem, MP3)
        </Button>

        <Input
          label="Arquivo do material"
          ref={matInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.mp3,.wav,.ogg"
          onChange={handleAddMaterial}
        />
      </div>
    </article>
  );
}

type DeleteTarget =
  | { type: "module"; moduleId: string | number; label: string }
  | {
      type: "lesson";
      moduleId: string | number;
      lessonId: string | number;
      label: string;
    };

export default function CreateCoursePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const cancelLeaveRef = useRef<HTMLButtonElement>(null);
  const editorRef = useRef<HTMLFieldSetElement>(null);
  const submitLock = useRef(false);

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [modules, setModules] = useState<ModuleState[]>([]);

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const { dirty, markSaved } = useUnsavedChanges(
    editorSnapshot({
      courseTitle,
      courseDescription,
      isPublished,
      modules,
      thumbnail: courseThumbnail,
    }),
    true,
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

  function handleCreateModule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newModuleName.trim();
    if (!name) return;
    setModules((m) => [...m, { id: createId(), name, lessons: [] }]);
    setNewModuleName("");
    setIsModuleModalOpen(false);
  }

  function handleMoveModule(
    moduleId: string | number,
    direction: "up" | "down",
  ) {
    setModules((current) => {
      const idx = current.findIndex((m) => m.id === moduleId);
      if (idx === -1) return current;
      return moveItem(current, idx, direction === "up" ? idx - 1 : idx + 1);
    });
  }

  function requestDeleteModule(moduleId: string | number, moduleName: string) {
    setDeleteTarget({
      type: "module",
      moduleId,
      label: `o módulo "${moduleName}"`,
    });
  }

  function handleAddLesson(moduleId: string | number) {
    setModules((current) =>
      current.map((m) =>
        m.id !== moduleId
          ? m
          : { ...m, lessons: [...m.lessons, createLesson()] },
      ),
    );
  }

  function handleUpdateLesson(moduleId: string | number, updated: LessonState) {
    setModules((current) =>
      current.map((m) =>
        m.id !== moduleId
          ? m
          : {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === updated.id ? updated : l,
              ),
            },
      ),
    );
  }

  function handleMoveLesson(
    moduleId: string | number,
    lessonId: string | number,
    direction: "up" | "down",
  ) {
    setModules((current) =>
      current.map((m) => {
        if (m.id !== moduleId) return m;
        const idx = m.lessons.findIndex((l) => l.id === lessonId);
        if (idx === -1) return m;
        return {
          ...m,
          lessons: moveItem(
            m.lessons,
            idx,
            direction === "up" ? idx - 1 : idx + 1,
          ),
        };
      }),
    );
  }

  function requestDeleteLesson(
    moduleId: string | number,
    lessonId: string | number,
    lessonNumber: number,
  ) {
    setDeleteTarget({
      type: "lesson",
      moduleId,
      lessonId,
      label: `a aula ${String(lessonNumber).padStart(2, "0")}`,
    });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;

    if (deleteTarget.type === "module") {
      setModules((m) => m.filter((mod) => mod.id !== deleteTarget.moduleId));
      setDeleteTarget(null);
      return;
    }

    setModules((current) =>
      current.map((m) => {
        if (m.id !== deleteTarget.moduleId) return m;
        return {
          ...m,
          lessons: m.lessons.filter((l) => l.id !== deleteTarget.lessonId),
        };
      }),
    );
    setDeleteTarget(null);
  }

  function handleSubmitCourse() {
    if (isPending || submitLock.current || !validateEditor()) return;
    if (!courseTitle.trim()) {
      toast("Campo obrigatório", {
        description: "Informe o título do curso para continuar.",
        variant: "error",
      });
      return;
    }

    if (modules.length === 0) {
      toast("Estrutura vazia", {
        description: "Adicione pelo menos um módulo ao curso.",
        variant: "error",
      });
      return;
    }

    const allLessons = modules.flatMap((m) => m.lessons);
    if (allLessons.length === 0) {
      toast("Módulo vazio", {
        description: "Adicione pelo menos uma aula em algum módulo.",
        variant: "error",
      });
      return;
    }

    const lessonSemTitulo = allLessons.find((l) => !l.title.trim());
    if (lessonSemTitulo) {
      toast("Título de aula ausente", {
        description: "Preencha o título de todas as aulas antes de continuar.",
        variant: "error",
      });
      return;
    }

    const lessonSemVideo = allLessons.find((l) => !l.videoFile);
    if (lessonSemVideo) {
      toast("Vídeo ausente", {
        description: `A aula "${lessonSemVideo.title}" ainda não tem vídeo.`,
        variant: "error",
      });
      return;
    }

    submitLock.current = true;
    startTransition(async () => {
      try {
        setUploadStatus("Preparando arquivos…");
        toast("Criando curso...", {
          description: "Aguarde enquanto salvamos as informações.",
          variant: "info",
        });

        const fd = new FormData();
        fd.append("courseTitle", courseTitle.trim());
        fd.append("courseDescription", courseDescription.trim());
        fd.append("isPublished", isPublished ? "1" : "0");

        if (courseThumbnail) {
          fd.append("thumbnailFile", courseThumbnail);
        }

        const moduleMeta = modules.map((mod) => ({
          id: mod.id,
          name: mod.name,
          lessons: mod.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            description: l.description,
            durationMinutes: l.durationMinutes,
            isFreePreview: l.isFreePreview,
          })),
        }));
        fd.append("modules", JSON.stringify(moduleMeta));

        async function uploadDirectlyToS3(file: File): Promise<string> {
          setUploadStatus(`Enviando ${file.name}…`);
          const res = await fetch("/api/admin/courses/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              content_type: file.type,
            }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Erro ao pegar URL");

          const putRes = await fetch(data.upload_url, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!putRes.ok)
            throw new Error(`Falha no upload: ${putRes.statusText}`);
          return data.path;
        }

        toast("Iniciando uploads...", {
          description: "Preparando arquivos...",
          variant: "info",
        });

        for (const mod of modules) {
          for (const lesson of mod.lessons) {
            if (lesson.videoFile) {
              toast(
                `Enviando vídeo (Aula ${lesson.title.substring(0, 10)}...)`,
                { variant: "info" },
              );
              const s3Path = await uploadDirectlyToS3(lesson.videoFile);
              fd.append(`video_path_${lesson.id}`, s3Path);
            }
            for (const mat of lesson.materials.filter(
              (item): item is MaterialState & { file: File } =>
                item.file !== null,
            )) {
              toast(`Enviando material (${mat.title.substring(0, 10)}...)`, {
                variant: "info",
              });
              const matPath = await uploadDirectlyToS3(mat.file);
              fd.append(`mat_path_${lesson.id}_${mat.id}`, matPath);
              fd.append(`mat_title_${lesson.id}_${mat.id}`, mat.title);
            }
          }
        }

        setUploadStatus("Arquivos enviados. Salvando a estrutura do curso…");
        const response = await fetch("/api/admin/courses/create", {
          method: "POST",
          body: fd,
        });
        const result = (await response.json()) as {
          success: boolean;
          error?: string;
          step?: string;
        };

        if (!response.ok || !result.success) {
          setSaveError(result.error || "Não foi possível salvar o curso.");
          setUploadStatus(
            "O envio não foi concluído. Revise o erro e tente novamente.",
          );
          toast("Erro ao criar curso", {
            description: `${result.error} (${result.step})`,
            variant: "error",
          });
          return;
        }

        toast("Curso criado com sucesso!", {
          description:
            "A estrutura já está pronta para aparecer para os alunos.",
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
        toast("Erro inesperado ao enviar curso", {
          description:
            error instanceof Error
              ? error.message
              : "Falha inesperada no frontend.",
          variant: "error",
        });
      } finally {
        submitLock.current = false;
      }
    });
  }

  return (
    <div className="bg-canvas min-h-screen">
      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
        <fieldset
          ref={editorRef}
          disabled={isPending}
          className="min-w-0 space-y-6 border-0 p-0"
        >
          <nav className="text-text-muted mb-3 flex items-center gap-1 text-sm">
            <span>Gerenciar Cursos</span>
            <MdKeyboardArrowRight size={16} />
            <span className="text-text-muted font-medium">Novo Curso</span>
          </nav>

          <section className="border-border bg-panel sticky top-[69px] z-20 mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-4 lg:top-0">
            <div>
              <h1 className="text-text text-2xl font-semibold sm:text-3xl">
                Novo curso
              </h1>
              <EditorStatus
                dirty={dirty}
                upload={uploadStatus}
                error={saveError}
              />
            </div>

            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:items-center sm:gap-3">
              <Button
                variant="secondary"
                type="button"
                onClick={requestLeave}
                disabled={isPending}
              >
                Descartar
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={handleSubmitCourse}
                disabled={isPending}
              >
                {isPending ? "Criando..." : "Criar Curso"}
              </Button>
            </div>
          </section>

          <section className="rounded-bento-md bg-panel ring-border p-6 ring-1">
            <h3 className="text-text mb-4 flex items-center gap-2 text-lg font-semibold">
              <MdOutlineInfo className="text-accent-text" size={18} />
              Informações Gerais
            </h3>

            <div className="flex flex-col gap-4">
              <Input
                label="Título do curso"
                error={
                  submitted && !courseTitle.trim()
                    ? "Informe o título do curso."
                    : undefined
                }
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Ex: Guitarra do zero ao avançado"
                required
              />

              <div className="text-text-muted text-sm font-medium">
                Foto do card do curso
                <div className="border-accent/40 bg-accent/5 mt-2 rounded-lg border border-dashed p-4 text-center">
                  <MdOutlineImage
                    className="text-text-muted mx-auto"
                    size={20}
                  />
                  <p className="text-text-muted mt-2 text-xs font-normal normal-case">
                    Selecione uma imagem para a capa do curso
                  </p>
                  {courseThumbnail && (
                    <p className="text-success mt-2 text-xs font-medium normal-case">
                      {courseThumbnail.name}
                    </p>
                  )}
                  <Input
                    label="Imagem"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setCourseThumbnail(e.target.files?.[0] ?? null)
                    }
                  />
                </div>
              </div>

              <Textarea
                label="Descrição do curso"
                rows={4}
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="Descreva o que o aluno aprenderá neste curso..."
              />

              <Checkbox
                label="Exibido na área do aluno"
                checked={isPublished}
                onChange={() => setIsPublished((current) => !current)}
              />
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-text text-xl font-semibold">
                Estrutura de Módulos
              </h3>
              <Button
                variant="secondary"
                type="button"
                onClick={() => setIsModuleModalOpen(true)}
              >
                + Novo Módulo
              </Button>
            </div>

            <div className="space-y-4">
              {modules.length === 0 && (
                <article className="border-accent/50 bg-accent/5 text-text-muted rounded-xl border border-dashed p-6 text-center text-sm">
                  Nenhum módulo criado. Clique em + Novo Módulo para começar.
                </article>
              )}

              {modules.map((module, moduleIndex) => (
                <article
                  key={module.id}
                  className="rounded-bento-sm bg-canvas ring-border p-4 ring-1"
                >
                  <header className="border-border mb-4 flex items-center justify-between rounded-full border bg-white px-4 py-3">
                    <div>
                      <p className="text-accent-text text-sm font-semibold">
                        Módulo {String(moduleIndex + 1).padStart(2, "0")}
                      </p>
                      <h4 className="text-text font-semibold">{module.name}</h4>
                    </div>

                    <div className="text-text-muted flex items-center gap-1">
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => handleMoveModule(module.id, "up")}
                        disabled={moduleIndex === 0}
                        aria-label={`Mover módulo ${moduleIndex + 1} para cima`}
                      >
                        <MdKeyboardArrowUp size={19} />
                      </Button>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => handleMoveModule(module.id, "down")}
                        disabled={moduleIndex === modules.length - 1}
                        aria-label={`Mover módulo ${moduleIndex + 1} para baixo`}
                      >
                        <MdKeyboardArrowDown size={19} />
                      </Button>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() =>
                          requestDeleteModule(module.id, module.name)
                        }
                        aria-label={`Apagar módulo ${moduleIndex + 1}`}
                      >
                        <MdOutlineDelete size={17} />
                      </Button>
                      <MdOutlineDragIndicator
                        size={18}
                        className="text-text-muted"
                      />
                    </div>
                  </header>

                  {module.lessons.length === 0 && (
                    <div className="border-border text-text-muted mb-4 rounded-lg border border-dashed bg-white px-4 py-6 text-center text-sm">
                      Módulo vazio. Clique em Adicionar Aula para inserir a
                      primeira aula.
                    </div>
                  )}

                  <div className="space-y-4">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <LessonCard
                        submitted={submitted}
                        key={lesson.id}
                        lesson={lesson}
                        lessonNumber={lessonIndex + 1}
                        canMoveUp={lessonIndex > 0}
                        canMoveDown={lessonIndex < module.lessons.length - 1}
                        onMoveUp={() =>
                          handleMoveLesson(module.id, lesson.id, "up")
                        }
                        onMoveDown={() =>
                          handleMoveLesson(module.id, lesson.id, "down")
                        }
                        onDelete={() =>
                          requestDeleteLesson(
                            module.id,
                            lesson.id,
                            lessonIndex + 1,
                          )
                        }
                        onChange={(updated) =>
                          handleUpdateLesson(module.id, updated)
                        }
                      />
                    ))}
                  </div>

                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => handleAddLesson(module.id)}
                  >
                    <MdOutlineAdd size={16} />
                    Adicionar Aula
                  </Button>
                </article>
              ))}
            </div>
          </section>
        </fieldset>
      </div>

      <ModuleNameModal
        open={isModuleModalOpen}
        value={newModuleName}
        onChange={setNewModuleName}
        onClose={() => {
          setIsModuleModalOpen(false);
          setNewModuleName("");
        }}
        onSubmit={handleCreateModule}
      />

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        label={deleteTarget?.label ?? ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
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
