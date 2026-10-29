"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
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
  MdOutlineEdit,
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

export default function ManageCoursesPage() {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";
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

      toast("Curso excluído", {
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
        toast("Erro ao alterar publicação", {
          description: result.error ?? "Tente novamente",
          variant: "error",
        });
        return;
      }

      toast(newState ? "Curso publicado" : "Curso despublicado", {
        description: newState
          ? `"${course.title}" agora aparece como curso principal em /aluno/home.`
          : `"${course.title}" foi ocultado da experiência do aluno.`,
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
    <div className="bg-surface min-h-screen">
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <section className="mb-6 rounded-bento-lg bg-surface-soft p-6 ring-1 ring-ink/10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-ink text-2xl font-semibold">
                Gerenciar Cursos
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-ink/75">
                O curso publicado aqui é o mesmo que aparece para o aluno em
                <span className="font-semibold text-ink"> /aluno/home</span>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchCourses}
                aria-label="Atualizar lista"
                disabled={loading}
                className="rounded-full border border-ink/15 bg-white px-3 py-2.5 text-sm font-medium text-ink/75 hover:bg-ink/5 disabled:opacity-50"
              >
                <MdRefresh size={17} aria-hidden className={loading ? "animate-spin motion-reduce:animate-none" : ""} />
              </button>
              {isAdmin && (
                <Link
                  href="/admin/cursos/criar"
                  className="bg-accent hover:bg-accent-500 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-accent-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <MdAddCircleOutline size={20} />
                  Novo Curso
                </Link>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-bento-sm bg-surface p-4">
            {featuredCourse ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-accent-ink">
                    Curso em destaque
                  </p>
                  <p className="mt-1 font-semibold text-ink">
                    {featuredCourse.title}
                  </p>
                  <p className="mt-1 text-sm text-ink/70">
                    Esse é o curso atualmente exibido para os alunos.
                  </p>
                </div>
                <span className="rounded-full bg-white px-4 py-2 ring-1 ring-ink/10 text-sm text-ink/70">
                  Edição detalhada em consolidação
                </span>
              </div>
            ) : (
              <p className="text-sm text-ink/75">
                Nenhum curso publicado no momento. Crie ou publique um curso para
                atualizar /aluno/home.
              </p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-bento-md bg-surface-soft ring-1 ring-ink/10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 p-4 sm:p-5">
            <h3 className="font-semibold text-ink">
              {loading
                ? "Carregando cursos..."
                : `${meta.total} curso${meta.total !== 1 ? "s" : ""} cadastrado${meta.total !== 1 ? "s" : ""}`}
            </h3>
            <label className="relative block">
              <MdSearch
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-ink/60"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar curso..."
                className="w-full rounded-full border border-ink/20 bg-white py-2.5 pr-4 pl-10 text-sm text-ink/85 outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 sm:w-72"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="bg-ink/5 text-sm font-medium text-ink/70">
                  <th className="px-6 py-4">Curso</th>
                  <th className="px-6 py-4">Módulos</th>
                  <th className="px-6 py-4">Aulas</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Criado em</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ink/10 text-sm">
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} aria-hidden>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg shimmer" />
                          <div>
                            <div className="h-3 w-40 rounded shimmer" />
                            <div className="mt-1.5 h-2.5 w-28 rounded bg-ink/5" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-3 w-8 rounded shimmer" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-8 rounded shimmer" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-20 rounded-full shimmer" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-24 rounded shimmer" /></td>
                      <td className="px-6 py-4"><div className="mx-auto h-7 w-20 rounded-lg shimmer" /></td>
                    </tr>
                  ))}

                {!loading && courses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-ink/70">
                      Nenhum curso cadastrado ainda.{" "}
                      <Link
                        href="/admin/cursos/criar"
                        className="text-accent-ink font-semibold underline"
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
                        className={`hover:bg-ink/[0.03] ${actionPending ? "opacity-60" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="h-10 w-10 rounded-bento-sm object-cover"
                              />
                            ) : (
                              <div
                                className="flex h-10 w-10 items-center justify-center rounded-bento-sm bg-accent/15 text-accent-ink"
                              >
                                <MdOutlineBookmarks size={18} />
                              </div>
                            )}
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-ink">
                                  {course.title}
                                </p>
                                {isFeatured && (
                                  <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-accent-ink">
                                    Exibido em /aluno/home
                                  </span>
                                )}
                              </div>
                              {course.description && (
                                <p className="max-w-xs truncate text-xs text-ink/60">
                                  {course.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-ink/75">
                            <MdOutlineBookmarks size={14} className="text-ink/60" />
                            {course.modules?.length ?? "—"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-ink/75">
                            <MdOutlineSchool size={14} className="text-ink/60" />
                            {course.lessons_count ?? "—"}
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

                        <td className="px-6 py-4 text-ink/70">
                          {formatDate(course.created_at)}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3 text-ink/60">
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(course)}
                              disabled={actionPending}
                              className={`rounded-full p-2 transition hover:bg-ink/5 ${
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

                            <Link
                              href={`/admin/cursos/${course.id}/editar`}
                              className="rounded-full p-2 transition hover:bg-ink/5 hover:text-accent-ink"
                              aria-label={`Editar ${course.title}`}
                              title="Editar curso"
                            >
                              <MdOutlineEdit size={18} />
                            </Link>

                            <button
                              type="button"
                              onClick={() => setDeleteTarget(course)}
                              disabled={actionPending}
                              className="rounded-full p-2 transition hover:bg-red-50 hover:text-red-500"
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

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 p-4 text-sm text-ink/70">
            <span>
              {loading
                ? "Carregando..."
                : `Exibindo ${meta.from ?? 0}–${meta.to ?? 0} de ${meta.total} cursos`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="rounded-full border border-ink/15 bg-white px-3 py-1.5 hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
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
                        ? "bg-accent font-semibold text-accent-ink"
                        : "border border-ink/15 bg-white text-ink/75 hover:bg-ink/5"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page || loading}
                className="rounded-full border border-ink/15 bg-white px-3 py-1.5 hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
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
        description="Essa ação é irreversível. Todos os módulos e aulas associados também serão removidos."
        confirmLabel="Sim, excluir"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
