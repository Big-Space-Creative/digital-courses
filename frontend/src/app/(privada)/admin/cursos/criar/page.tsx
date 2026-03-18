"use client";

import { FormEvent, useState } from "react";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import ModuleNameModal from "../../components/ModuleNameModal";
import {
  MdKeyboardArrowRight,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlineAdd,
  MdOutlineDragIndicator,
  MdOutlineDelete,
  MdOutlineImage,
  MdOutlineInfo,
  MdOutlineInsertDriveFile,
  MdOutlineUploadFile,
} from "react-icons/md";

type Lesson = {
  id: string;
};

type ModuleItem = {
  id: string;
  name: string;
  lessons: Lesson[];
};

type DeleteTarget =
  | { type: "module"; moduleId: string; label: string }
  | { type: "lesson"; moduleId: string; lessonId: string; label: string };

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

type LessonCardProps = {
  lessonNumber: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
};

function LessonCard({
  lessonNumber,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDelete,
}: LessonCardProps) {
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
          Titulo da aula
          <input
            defaultValue="Conhecendo as partes da guitarra"
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-700 outline-none focus:border-orange-300"
          />
        </label>

        <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Link do video (Vimeo/Youtube)
          <input
            defaultValue="https://vimeo.com/87239102"
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-700 outline-none focus:border-orange-300"
          />
        </label>
      </div>

      <label className="mt-4 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Resumo da aula
        <textarea
          rows={4}
          placeholder="Descreva o que o aluno aprendera nesta aula..."
          className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-3 text-sm font-normal text-gray-700 outline-none focus:border-orange-300"
        />
      </label>

      <label className="mt-4 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Dica para praticar
        <textarea
          rows={4}
          placeholder="De uma breve dica para praticar..."
          className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-3 text-sm font-normal text-gray-700 outline-none focus:border-orange-300"
        />
      </label>

      <div className="mt-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Materiais de referencia
        <div className="mt-2 rounded-lg border border-dashed border-orange-200 bg-orange-50/40 p-6 text-center">
          <MdOutlineUploadFile className="mx-auto text-gray-400" size={20} />
          <p className="mt-2 text-xs font-normal text-gray-500">
            Clique para fazer upload ou arraste arquivos (PDF, Guitar Pro, MP3)
          </p>
          <span className="text-primary mt-3 inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium">
            <MdOutlineInsertDriveFile size={14} />
            introducao_aula_gp5.pdf
          </span>
        </div>
      </div>
    </article>
  );
}

export default function CreateCoursePage() {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const handleCreateModule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const moduleName = newModuleName.trim();
    if (!moduleName) return;

    setModules((currentModules) => [
      ...currentModules,
      {
        id: createId(),
        name: moduleName,
        lessons: [],
      },
    ]);

    setNewModuleName("");
    setIsModuleModalOpen(false);
  };

  const handleAddLesson = (moduleId: string) => {
    setModules((currentModules) =>
      currentModules.map((module) => {
        if (module.id !== moduleId) return module;

        return {
          ...module,
          lessons: [...module.lessons, { id: createId() }],
        };
      }),
    );
  };

  const requestDeleteModule = (moduleId: string, moduleName: string) => {
    setDeleteTarget({
      type: "module",
      moduleId,
      label: `o modulo \"${moduleName}\"`,
    });
  };

  const handleMoveModule = (moduleId: string, direction: "up" | "down") => {
    setModules((currentModules) => {
      const currentIndex = currentModules.findIndex(
        (module) => module.id === moduleId,
      );

      if (currentIndex === -1) return currentModules;

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      return moveItem(currentModules, currentIndex, targetIndex);
    });
  };

  const requestDeleteLesson = (
    moduleId: string,
    lessonId: string,
    lessonNumber: number,
  ) => {
    setDeleteTarget({
      type: "lesson",
      moduleId,
      lessonId,
      label: `a aula ${String(lessonNumber).padStart(2, "0")}`,
    });
  };

  const handleMoveLesson = (
    moduleId: string,
    lessonId: string,
    direction: "up" | "down",
  ) => {
    setModules((currentModules) =>
      currentModules.map((module) => {
        if (module.id !== moduleId) return module;

        const currentIndex = module.lessons.findIndex(
          (lesson) => lesson.id === lessonId,
        );

        if (currentIndex === -1) return module;

        const targetIndex =
          direction === "up" ? currentIndex - 1 : currentIndex + 1;

        return {
          ...module,
          lessons: moveItem(module.lessons, currentIndex, targetIndex),
        };
      }),
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "module") {
      setModules((currentModules) =>
        currentModules.filter((module) => module.id !== deleteTarget.moduleId),
      );
      setDeleteTarget(null);
      return;
    }

    setModules((currentModules) =>
      currentModules.map((module) => {
        if (module.id !== deleteTarget.moduleId) return module;

        return {
          ...module,
          lessons: module.lessons.filter(
            (lesson) => lesson.id !== deleteTarget.lessonId,
          ),
        };
      }),
    );
    setDeleteTarget(null);
  };

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto w-full max-w-6xl p-8">
        <nav className="mb-3 flex items-center gap-1 text-sm text-gray-500">
          <span>Gerenciar Cursos</span>
          <MdKeyboardArrowRight size={16} />
          <span className="font-medium text-gray-700">Novo Curso</span>
        </nav>

        <section className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-secondary text-5xl font-bold">Novo Curso</h2>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
              Descartar
            </button>
            <button className="bg-primary hover:bg-primary-dark rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition">
              Criar Curso
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <MdOutlineInfo className="text-primary" size={18} />
            Informacoes Gerais
          </h3>

          <div className="flex flex-col gap-4">
            <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Titulo do curso
              <input
                defaultValue="Guitarra do zero ao avancado"
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
                <input
                  type="file"
                  accept="image/*"
                  className="mt-3 block w-full text-xs font-normal text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-orange-100 file:px-3 file:py-2 file:font-medium file:text-orange-700 hover:file:bg-orange-200"
                />
              </div>
            </label>
          </div>

          <label className="mt-4 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Descricao do curso
            <textarea
              rows={4}
              placeholder="Descreva o que o aluno aprendera neste curso..."
              className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-3 text-sm font-normal text-gray-700 outline-none focus:border-orange-300"
            />
          </label>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">
              Estrutura de Modulos
            </h3>
            <button
              type="button"
              onClick={() => setIsModuleModalOpen(true)}
              className="text-primary rounded-lg bg-orange-100 px-3 py-2 text-sm font-semibold hover:bg-orange-200"
            >
              + Novo Modulo
            </button>
          </div>

          <div className="space-y-4">
            {modules.length === 0 && (
              <article className="rounded-xl border border-dashed border-orange-300 bg-orange-50/40 p-6 text-center text-sm text-gray-500">
                Nenhum modulo criado. Clique em + Novo Modulo para comecar.
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
                      Modulo {String(moduleIndex + 1).padStart(2, "0")}
                    </p>
                    <h4 className="font-semibold text-gray-900">
                      {module.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500">
                    <button
                      type="button"
                      onClick={() => handleMoveModule(module.id, "up")}
                      disabled={moduleIndex === 0}
                      className="rounded-md p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Mover modulo ${moduleIndex + 1} para cima`}
                    >
                      <MdKeyboardArrowUp size={19} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveModule(module.id, "down")}
                      disabled={moduleIndex === modules.length - 1}
                      className="rounded-md p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Mover modulo ${moduleIndex + 1} para baixo`}
                    >
                      <MdKeyboardArrowDown size={19} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        requestDeleteModule(module.id, module.name)
                      }
                      className="rounded-md p-1 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Apagar modulo ${moduleIndex + 1}`}
                    >
                      <MdOutlineDelete size={17} />
                    </button>
                    <MdOutlineDragIndicator
                      size={18}
                      className="text-gray-400"
                    />
                  </div>
                </header>

                {module.lessons.length === 0 && (
                  <div className="mb-4 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
                    Modulo vazio. Clique em Adicionar Aula para inserir a
                    primeira aula.
                  </div>
                )}

                <div className="space-y-4">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <LessonCard
                      key={lesson.id}
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
