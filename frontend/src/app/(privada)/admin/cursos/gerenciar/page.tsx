"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "@/components/ui/Toast";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import {
  deleteCourseAction,
  getFeaturedCourseAction,
  listCoursesAction,
  togglePublishCourseAction,
  type ApiCourse,
  type CoursesPaginated,
} from "@/app/actions/courses";
import {
  MdAddCircleOutline,
  MdOutlineBookmarks,
  MdOutlineDelete,
  MdOutlineSchool,
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
  MdRefresh,
  MdSearch,
} from "react-icons/md";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const thumbGradients = [
  "from-orange-300 to-amber-600",
  "from-cyan-300 to-blue-500",
  "from-violet-300 to-purple-600",
  "from-green-300 to-emerald-600",
  "from-pink-300 to-rose-600",
];

function thumbGradient(id: number) {
  return thumbGradients[id % thumbGradients.length];
}

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [featuredCourseId, setFeaturedCourseId] = useState<number | null>(null);
  const [meta, setMeta] = useState<Omit<CoursesPaginated, "data">>({
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
    per_page: 20,
    current_page: 1,
  });
  const [loading, startLoading] = useTransition();
  const [actionPending, startAction] = useTransition();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ApiCourse | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCourses = useCallback(() => {
    startLoading(async () => {
      const [coursesResult, featuredResult] = await Promise.all([
        listCoursesAction({
          search: debouncedSearch || undefined,
          page,
          perPage: 15,
        }),
        getFeaturedCourseAction(),
      ]);

      if (!coursesResult.success) {
        toast("Erro ao carregar cursos", {
          description: coursesResult.error,
          variant: "error",
        });
        return;
      }

      const { data, ...pageMeta } = coursesResult.data;
      setCourses(data);
      setMeta(pageMeta);
      setFeaturedCourseId(featuredResult.success ? featuredResult.data.id : null);
    });
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const featuredCourse = useMemo(
    () => courses.find((course) => course.id === featuredCourseId) ?? null,
    [courses, featuredCourseId],
  );

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);

    startAction(async () => {
      const result = await deleteCourseAction(target.id);
      if (!result.success) {
        toast("Erro ao excluir", {
          description: result.error ?? "Tente novamente",
          variant: "error",
        });
        return;
      }

      toast("Curso excluÃ­do", {
        description: `"${target.title}" foi removido.`,
        variant: "success",
      });

      setCourses((prev) => prev.filter((c) => c.id !== target.id));

      if (featuredCourseId === target.id) {
        setFeaturedCourseId(null);
      }
    });
  }

  function handleTogglePublish(course: ApiCourse) {
    startAction(async () => {
      const newState = !course.is_published;
      const result = await togglePublishCourseAction(course.id, newState);

      if (!result.success) {
        toast("Erro ao alterar publicaÃ§Ã£o", {
          description: result.error ?? "Tente novamente",
          variant: "error",
        });
        return;
      }

      toast(newState ? "Curso publicado" : "Curso despublicado", {
        description: newState
          ? `"${course.title}" agora aparece como curso principal em /aluno/home.`
          : `"${course.title}" foi ocultado da experiÃªncia do aluno.`,
        variant: "success",
      });

      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, is_published: newState } : c,
        ),
      );
      fetchCourses();
    });
  }

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <section className="mb-6 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-secondary text-2xl font-bold">
                Gerenciar Cursos
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-600">
                O curso publicado aqui Ã© o mesmo que aparece para o aluno em
                <span className="font-semibold text-gray-800"> /aluno/home</span>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchCourses}
                disabled={loading}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <MdRefresh size={17} className={loading ? "animate-spin" : ""} />
              </button>
              <Link
                href="/admin/cursos/criar"
                className="bg-primary hover:bg-primary-dark inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors"
              >
                <MdAddCircleOutline size={20} />
                Novo Curso
              </Link>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-orange-200 bg-white/80 p-4">
            {featuredCourse ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold tracking-[0.12em] text-orange-600 uppercase">
                    Curso em destaque
                  </p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {featuredCourse.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Esse Ã© o curso atualmente exibido para os alunos.
                  </p>
                </div>
                <span className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-2 text-sm text-gray-500">
                  EdiÃ§Ã£o detalhada em consolidaÃ§Ã£o
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Nenhum curso publicado no momento. Crie ou publique um curso para
                atualizar /aluno/home.
              </p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
            <h3 className="font-semibold text-gray-800">
              {loading
                ? "Carregando cursos..."
                : `${meta.total} curso${meta.total !== 1 ? "s" : ""} cadastrado${meta.total !== 1 ? "s" : ""}`}
            </h3>
            <label className="relative block">
              <MdSearch
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar curso..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm text-gray-700 outline-none focus:border-orange-300 sm:w-72"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="bg-gray-100 text-xs font-semibold tracking-[0.12em] text-gray-500 uppercase">
                  <th className="px-6 py-4">Curso</th>
                  <th className="px-6 py-4">MÃ³dulos</th>
                  <th className="px-6 py-4">Aulas</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Criado em</th>
                  <th className="px-6 py-4 text-center">AÃ§Ãµes</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-200" />
                          <div>
                            <div className="h-3 w-40 rounded bg-gray-200" />
                            <div className="mt-1.5 h-2.5 w-28 rounded bg-gray-100" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-3 w-8 rounded bg-gray-200" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-8 rounded bg-gray-200" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-20 rounded-full bg-gray-200" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-24 rounded bg-gray-200" /></td>
                      <td className="px-6 py-4"><div className="mx-auto h-7 w-20 rounded-lg bg-gray-200" /></td>
                    </tr>
                  ))}

                {!loading && courses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhum curso cadastrado ainda.{" "}
                      <Link
                        href="/admin/cursos/criar"
                        className="text-primary font-semibold underline"
                      >
                        Criar primeiro curso
                      </Link>
                    </td>
                  </tr>
                )}

                {!loading &&
                  courses.map((course) => {
                    const isFeatured = course.id === featuredCourseId;

                    return (
                      <tr
                        key={course.id}
                        className={`hover:bg-gray-50/70 ${actionPending ? "opacity-60" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white ${thumbGradient(course.id)}`}
                              >
                                <MdOutlineBookmarks size={18} />
                              </div>
                            )}
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-gray-800">
                                  {course.title}
                                </p>
                                {isFeatured && (
                                  <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold text-orange-700">
                                    Exibido em /aluno/home
                                  </span>
                                )}
                              </div>
                              {course.description && (
                                <p className="max-w-xs truncate text-xs text-gray-400">
                                  {course.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MdOutlineBookmarks size={14} className="text-gray-400" />
                            {course.modules?.length ?? "â€”"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MdOutlineSchool size={14} className="text-gray-400" />
                            {course.lessons_count ?? "â€”"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              course.is_published
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {course.is_published ? "Publicado" : "Rascunho"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {formatDate(course.created_at)}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3 text-gray-400">
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(course)}
                              disabled={actionPending}
                              className={`rounded-md p-1.5 transition hover:bg-gray-100 ${
                                course.is_published
                                  ? "hover:text-amber-500"
                                  : "hover:text-green-600"
                              }`}
                              aria-label={
                                course.is_published
                                  ? `Despublicar ${course.title}`
                                  : `Publicar ${course.title}`
                              }
                              title={
                                course.is_published
                                  ? "Despublicar curso"
                                  : "Publicar para alunos"
                              }
                            >
                              {course.is_published ? (
                                <MdOutlineVisibilityOff size={18} />
                              ) : (
                                <MdOutlineVisibility size={18} />
                              )}
                            </button>

                            <span
                              className="rounded-md p-1.5 text-gray-300"
                              aria-label={`EdiÃ§Ã£o de ${course.title} ainda indisponÃ­vel`}
                              title="EdiÃ§Ã£o detalhada em consolidaÃ§Ã£o"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="h-[18px] w-[18px]"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11Zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-1.79Z" />
                              </svg>
                            </span>

                            <button
                              type="button"
                              onClick={() => setDeleteTarget(course)}
                              disabled={actionPending}
                              className="rounded-md p-1.5 transition hover:bg-red-50 hover:text-red-500"
                              aria-label={`Excluir ${course.title}`}
                              title="Excluir curso"
                            >
                              <MdOutlineDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 p-4 text-sm text-gray-500">
            <span>
              {loading
                ? "Carregandoâ€¦"
                : `Exibindo ${meta.from ?? 0}â€“${meta.to ?? 0} de ${meta.total} cursos`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                &lt;
              </button>
              {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className={`rounded-lg px-3 py-1.5 ${
                      p === page
                        ? "bg-orange-500 font-semibold text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page || loading}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                &gt;
              </button>
            </div>
          </footer>
        </section>
      </main>

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        label={deleteTarget?.title ?? ""}
        title="Excluir curso"
        description="Essa aÃ§Ã£o Ã© irreversÃ­vel. Todos os mÃ³dulos e aulas associados tambÃ©m serÃ£o removidos."
        confirmLabel="Sim, excluir"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
