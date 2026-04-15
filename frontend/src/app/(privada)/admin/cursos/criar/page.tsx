"use client";

import { type ChangeEvent, type FormEvent, useRef, useState, useTransition } from "react";
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
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
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

  function handleRemoveMaterial(matId: string) {
    onChange({
      ...lesson,
      materials: lesson.materials.filter((m) => m.id !== matId),
    });
  }

  function handleMatTitleChange(matId: string, newTitle: string) {
    onChange({
      ...lesson,
      materials: lesson.materials.map((m) =>
        m.id === matId ? { ...m, title: newTitle } : m,
      ),
    });
  }

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <MdOutlineInfo className="text-primary" size={16} />
          Aula {String(lessonNumber).padStart(2, "0")}
        </div>

        <div className="flex items-center gap-1 text-gray-500">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="rounded-md p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Mover aula ${lessonNumber} para cima`}
          >
            <MdKeyboardArrowUp size={18} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="rounded-md p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Mover aula ${lessonNumber} para baixo`}
          >
            <MdKeyboardArrowDown size={18} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md p-1 hover:bg-red-50 hover:text-red-600"
            aria-label={`Apagar aula ${lessonNumber}`}
          >
            <MdOutlineDelete size={17} />
          </button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Título da aula *
          <input
            value={lesson.title}
            onChange={(e) => onChange({ ...lesson, title: e.target.value })}
            placeholder="Ex: Conhecendo as partes da guitarra"
            required
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-700 outline-none focus:border-orange-300"
          />
        </label>

        <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Duração (minutos)
          <input
            type="number"
            min="1"
            value={lesson.durationMinutes}
            onChange={(e) =>
              onChange({ ...lesson, durationMinutes: e.target.value })
            }
            placeholder="Ex: 15"
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-700 outline-none focus:border-orange-300"
          />
        </label>
      </div>

      <label className="mt-4 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Resumo da aula
        <textarea
          rows={3}
          value={lesson.description}
          onChange={(e) => onChange({ ...lesson, description: e.target.value })}
          placeholder="Descreva o que o aluno aprenderá nesta aula..."
          className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-3 text-sm font-normal text-gray-700 outline-none focus:border-orange-300"
        />
      </label>

      <button
        type="button"
        onClick={() =>
          onChange({ ...lesson, isFreePreview: !lesson.isFreePreview })
        }
        className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
      >
        {lesson.isFreePreview ? (
          <MdOutlineCheckBox size={18} className="text-primary" />
        ) : (
          <MdOutlineCheckBoxOutlineBlank size={18} />
        )}
        Aula gratuita (free preview)
      </button>

      <div className="mt-4">
        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Vídeo da aula *
        </p>

        {lesson.videoFile ? (
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <MdOutlineVideocam size={18} className="shrink-0 text-green-600" />
            <span className="flex-1 truncate text-sm text-green-700">
              {lesson.videoFile.name}
            </span>
            <span className="shrink-0 text-xs text-green-500">
              ({(lesson.videoFile.size / 1024 / 1024).toFixed(1)} MB)
            </span>
            <button
              type="button"
              onClick={() => {
                onChange({ ...lesson, videoFile: null });
                if (videoInputRef.current) videoInputRef.current.value = "";
              }}
              className="shrink-0 text-gray-400 hover:text-red-500"
              aria-label="Remover vídeo"
            >
              <MdClose size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="mt-2 w-full rounded-lg border border-dashed border-orange-200 bg-orange-50/40 p-5 text-center hover:bg-orange-50"
          >
            <MdOutlineUploadFile className="mx-auto text-gray-400" size={22} />
            <p className="mt-2 text-xs font-medium text-gray-500 normal-case">
              Clique para selecionar o arquivo de vídeo
            </p>
            <p className="mt-1 text-xs text-gray-400 normal-case">
              MP4, MOV, AVI, MKV, WebM
            </p>
          </button>
        )}

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
          className="hidden"
          onChange={handleVideoChange}
        />
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Materiais de referência
        </p>

        {lesson.materials.length > 0 && (
          <div className="mt-2 space-y-2">
            {lesson.materials.map((mat) => (
              <div
                key={mat.id}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <MdOutlineInsertDriveFile
                  size={16}
                  className="shrink-0 text-orange-400"
                />
                <input
                  value={mat.title}
                  onChange={(e) => handleMatTitleChange(mat.id, e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                placeholder="Título do material"
                />
                <span className="shrink-0 text-xs text-gray-400">
                  ({(mat.file.size / 1024).toFixed(0)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(mat.id)}
                  className="shrink-0 text-gray-400 hover:text-red-500"
                  aria-label="Remover material"
                >
                  <MdClose size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => matInputRef.current?.click()}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-orange-200 bg-orange-50/40 p-3 text-xs font-medium text-gray-500 hover:bg-orange-50 normal-case"
        >
          <MdOutlineAdd size={16} className="text-primary" />
          Adicionar material (PDF, imagem, MP3)
        </button>

        <input
          ref={matInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.mp3,.wav,.ogg"
          className="hidden"
          onChange={handleAddMaterial}
        />
      </div>
    </article>
  );
}

type DeleteTarget =
  | { type: "module"; moduleId: string; label: string }
  | { type: "lesson"; moduleId: string; lessonId: string; label: string };

export default function CreateCoursePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [modules, setModules] = useState<ModuleState[]>([]);

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  function handleCreateModule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newModuleName.trim();
    if (!name) return;
    setModules((m) => [...m, { id: createId(), name, lessons: [] }]);
    setNewModuleName("");
    setIsModuleModalOpen(false);
  }

  function handleMoveModule(moduleId: string, direction: "up" | "down") {
    setModules((current) => {
      const idx = current.findIndex((m) => m.id === moduleId);
      if (idx === -1) return current;
      return moveItem(current, idx, direction === "up" ? idx - 1 : idx + 1);
    });
  }

  function requestDeleteModule(moduleId: string, moduleName: string) {
    setDeleteTarget({ type: "module", moduleId, label: `o módulo "${moduleName}"` });
  }

  function handleAddLesson(moduleId: string) {
    setModules((current) =>
      current.map((m) =>
        m.id !== moduleId ? m : { ...m, lessons: [...m.lessons, createLesson()] },
      ),
    );
  }

  function handleUpdateLesson(moduleId: string, updated: LessonState) {
    setModules((current) =>
      current.map((m) =>
        m.id !== moduleId
          ? m
          : {
              ...m,
              lessons: m.lessons.map((l) => (l.id === updated.id ? updated : l)),
            },
      ),
    );
  }

  function handleMoveLesson(
    moduleId: string,
    lessonId: string,
    direction: "up" | "down",
  ) {
    setModules((current) =>
      current.map((m) => {
        if (m.id !== moduleId) return m;
        const idx = m.lessons.findIndex((l) => l.id === lessonId);
        if (idx === -1) return m;
        return {
          ...m,
          lessons: moveItem(m.lessons, idx, direction === "up" ? idx - 1 : idx + 1),
        };
      }),
    );
  }

  function requestDeleteLesson(
    moduleId: string,
    lessonId: string,
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

    startTransition(async () => {
      try {
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
          const res = await fetch("/api/admin/courses/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: file.name, content_type: file.type }),
          });
          const data = await res.json();
          if(!data.success) throw new Error(data.error || "Erro ao pegar URL");
          
          const putRes = await fetch(data.upload_url, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if(!putRes.ok) throw new Error(`Falha no upload: ${putRes.statusText}`);
          return data.path;
        }

        toast("Iniciando uploads...", { description: "Preparando arquivos...", variant: "info" });

        for (const mod of modules) {
          for (const lesson of mod.lessons) {
            if (lesson.videoFile) {
              toast(`Enviando vídeo (Aula ${lesson.title.substring(0,10)}...)`, { variant: "info" });
              const s3Path = await uploadDirectlyToS3(lesson.videoFile);
              fd.append(`video_path_${lesson.id}`, s3Path);
            }
            for (const mat of lesson.materials) {
              toast(`Enviando material (${mat.title.substring(0,10)}...)`, { variant: "info" });
              const matPath = await uploadDirectlyToS3(mat.file);
              fd.append(`mat_path_${lesson.id}_${mat.id}`, matPath);
              fd.append(`mat_title_${lesson.id}_${mat.id}`, mat.title);
            }
          }
        }

        const response = await fetch("/api/admin/courses/create", {
          method: "POST",
          body: fd,
        });
        const result = (await response.json()) as {
          success: boolean;
          error?: string;
          step?: string;
        };

        if (!result.success) {
          toast("Erro ao criar curso", {
            description: `${result.error} (${result.step})`,
            variant: "error",
          });
          return;
        }

        toast("Curso criado com sucesso!", {
          description: "A estrutura já está pronta para aparecer para os alunos.",
          variant: "success",
        });

        router.push("/admin/cursos/gerenciar");
      } catch (error) {
        toast("Erro inesperado ao enviar curso", {
          description:
            error instanceof Error ? error.message : "Falha inesperada no frontend.",
          variant: "error",
        });
      }
    });
  }

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
        <nav className="mb-3 flex items-center gap-1 text-sm text-gray-500">
          <span>Gerenciar Cursos</span>
          <MdKeyboardArrowRight size={16} />
          <span className="font-medium text-gray-700">Novo Curso</span>
        </nav>

        <section className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-secondary text-2xl font-bold sm:text-3xl">
              Novo Curso
            </h2>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isPending}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={handleSubmitCourse}
              disabled={isPending}
              className="bg-primary hover:bg-primary-dark rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
            >
              {isPending ? "Criando..." : "Criar Curso"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <MdOutlineInfo className="text-primary" size={18} />
            Informações Gerais
          </h3>

          <div className="flex flex-col gap-4">
            <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Título do curso *
              <input
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Ex: Guitarra do zero ao avançado"
                required
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-700 outline-none focus:border-orange-300"
              />
            </label>

            <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Foto do card do curso
              <div className="mt-2 rounded-lg border border-dashed border-orange-200 bg-orange-50/40 p-4 text-center">
                <MdOutlineImage className="mx-auto text-gray-400" size={20} />
                <p className="mt-2 text-xs font-normal text-gray-500 normal-case">
                  Clique para selecionar ou arraste a imagem da capa do curso
                </p>
                {courseThumbnail && (
                  <p className="mt-2 text-xs font-medium text-green-700 normal-case">
                    {courseThumbnail.name}
                  </p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCourseThumbnail(e.target.files?.[0] ?? null)}
                  className="mt-3 block w-full text-xs font-normal text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-orange-100 file:px-3 file:py-2 file:font-medium file:text-orange-700 hover:file:bg-orange-200"
                />
              </div>
            </label>

            <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Descrição do curso
              <textarea
                rows={4}
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="Descreva o que o aluno aprenderá neste curso..."
                className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-3 text-sm font-normal text-gray-700 outline-none focus:border-orange-300"
              />
            </label>

            <button
              type="button"
              onClick={() => setIsPublished((current) => !current)}
              className="flex items-center gap-2 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase"
            >
              {isPublished ? (
                <MdOutlineCheckBox size={18} className="text-primary" />
              ) : (
                <MdOutlineCheckBoxOutlineBlank size={18} />
              )}
              Publicar este curso e exibi-lo em /aluno/home
            </button>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">
              Estrutura de Módulos
            </h3>
            <button
              type="button"
              onClick={() => setIsModuleModalOpen(true)}
              className="text-primary rounded-lg bg-orange-100 px-3 py-2 text-sm font-semibold hover:bg-orange-200"
            >
              + Novo Módulo
            </button>
          </div>

          <div className="space-y-4">
            {modules.length === 0 && (
              <article className="rounded-xl border border-dashed border-orange-300 bg-orange-50/40 p-6 text-center text-sm text-gray-500">
                Nenhum módulo criado. Clique em + Novo Módulo para começar.
              </article>
            )}

            {modules.map((module, moduleIndex) => (
              <article
                key={module.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <header className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                  <div>
                    <p className="text-primary text-xs font-bold tracking-wider uppercase">
                      Módulo {String(moduleIndex + 1).padStart(2, "0")}
                    </p>
                    <h4 className="font-semibold text-gray-900">{module.name}</h4>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500">
                    <button
                      type="button"
                      onClick={() => handleMoveModule(module.id, "up")}
                      disabled={moduleIndex === 0}
                      className="rounded-md p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Mover módulo ${moduleIndex + 1} para cima`}
                    >
                      <MdKeyboardArrowUp size={19} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveModule(module.id, "down")}
                      disabled={moduleIndex === modules.length - 1}
                      className="rounded-md p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Mover módulo ${moduleIndex + 1} para baixo`}
                    >
                      <MdKeyboardArrowDown size={19} />
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteModule(module.id, module.name)}
                      className="rounded-md p-1 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Apagar módulo ${moduleIndex + 1}`}
                    >
                      <MdOutlineDelete size={17} />
                    </button>
                    <MdOutlineDragIndicator size={18} className="text-gray-400" />
                  </div>
                </header>

                {module.lessons.length === 0 && (
                  <div className="mb-4 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
                    Módulo vazio. Clique em Adicionar Aula para inserir a primeira aula.
                  </div>
                )}

                <div className="space-y-4">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      lessonNumber={lessonIndex + 1}
                      canMoveUp={lessonIndex > 0}
                      canMoveDown={lessonIndex < module.lessons.length - 1}
                      onMoveUp={() => handleMoveLesson(module.id, lesson.id, "up")}
                      onMoveDown={() => handleMoveLesson(module.id, lesson.id, "down")}
                      onDelete={() =>
                        requestDeleteLesson(module.id, lesson.id, lessonIndex + 1)
                      }
                      onChange={(updated) => handleUpdateLesson(module.id, updated)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddLesson(module.id)}
                  className="text-primary mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-orange-300 py-2.5 text-sm font-semibold hover:bg-orange-50"
                >
                  <MdOutlineAdd size={16} />
                  Adicionar Aula
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>

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
    </div>
  );
}
