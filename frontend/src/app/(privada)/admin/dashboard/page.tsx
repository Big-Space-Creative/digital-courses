"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { toast } from "@/components/ui/Toast";
import {
  deleteAdminCommentAction,
  listAdminCommentsAction,
  type LessonComment,
} from "@/app/actions/comments";
import {
  deleteCourseAction,
  getDashboardStatsAction,
  listCoursesAction,
  type ApiCourse,
  type DashboardStats,
} from "@/app/actions/courses";
import {
  MdAddCircleOutline,
  MdDeleteOutline,
  MdEdit,
  MdOutlineChat,
  MdOutlineForum,
  MdOutlineReply,
  MdOutlineSchool,
  MdPeople,
  MdPlayCircle,
  MdSearch,
} from "react-icons/md";

function safeParam(value: string | null | undefined, fallback: string) {
  return encodeURIComponent((value ?? fallback).toString());
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"overview" | "comments">("overview");
  const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, startStatsLoading] = useTransition();

  // ── Courses table ─────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [coursesLoading, startCoursesLoading] = useTransition();
  const [courseDeleting, startCourseDeleting] = useTransition();

  // ── Comments ──────────────────────────────────────────────────────────────
  const [commentSearch, setCommentSearch] = useState("");
  const [debouncedCommentSearch, setDebouncedCommentSearch] = useState("");
  const [commentPage, setCommentPage] = useState(1);
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [commentMeta, setCommentMeta] = useState({
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
    current_page: 1,
    per_page: 15,
  });
  const [commentLoading, startCommentLoading] = useTransition();
  const [commentDeleting, startCommentDeleting] = useTransition();
  const [deleteTargetComment, setDeleteTargetComment] = useState<LessonComment | null>(null);

  const isAdmin = user?.role === "admin";
  const displayName = user?.name ?? "Usuário";

  // ── Load Stats ────────────────────────────────────────────────────────────
  useEffect(() => {
    startStatsLoading(async () => {
      const result = await getDashboardStatsAction();
      if (result.success) setStats(result.data);
    });
  }, []);

  // ── Load Courses ──────────────────────────────────────────────────────────
  const fetchCourses = useCallback(() => {
    startCoursesLoading(async () => {
      const result = await listCoursesAction({ perPage: 5, page: 1 });
      if (result.success) setCourses(result.data.data);
    });
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // ── Delete course (dashboard) ─────────────────────────────────────────────
  function handleDeleteCourse() {
    if (!selectedCourse) return;
    const target = selectedCourse;
    setSelectedCourse(null);

    startCourseDeleting(async () => {
      const result = await deleteCourseAction(target.id);
      if (!result.success) {
        toast("Erro ao excluir curso", {
          description: result.error ?? "Tente novamente.",
          variant: "error",
        });
        return;
      }

      toast("Curso excluído", {
        description: `"${target.title}" foi removido com sucesso.`,
        variant: "success",
      });

      setCourses((prev) => prev.filter((c) => c.id !== target.id));
    });
  }

  // ── Comments debounce ─────────────────────────────────────────────────────
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedCommentSearch(commentSearch);
      setCommentPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [commentSearch]);

  const fetchComments = useCallback(() => {
    startCommentLoading(async () => {
      const result = await listAdminCommentsAction({
        search: debouncedCommentSearch || undefined,
        page: commentPage,
        perPage: 15,
      });

      if (!result.success) {
        toast("Erro ao carregar comentarios", {
          description: result.error,
          variant: "error",
        });
        return;
      }

      const { data, total, last_page, from, to, current_page, per_page } = result.data;
      setComments(data);
      setCommentMeta({ total, last_page, from, to, current_page, per_page });
    });
  }, [commentPage, debouncedCommentSearch]);

  useEffect(() => {
    if (activeTab === "comments") {
      fetchComments();
    }
  }, [activeTab, fetchComments]);

  const commentStats = useMemo(
    () => ({
      total: commentMeta.total,
      loaded: comments.length,
    }),
    [commentMeta.total, comments.length],
  );

  function handleGoToUser(comment: LessonComment) {
    if (!comment.user?.id) {
      toast("Comentario sem usuario vinculado", {
        description: "Nao foi possivel abrir gestao do perfil para este comentario.",
        variant: "info",
      });
      return;
    }

    const role = safeParam(comment.user.role, "student");
    const plan = safeParam(comment.user.subscription_type, "free");

    router.push(`/admin/alunos?manageFromComment=${comment.user.id}&targetRole=${role}&targetPlan=${plan}`);
  }

  function handleDeleteComment() {
    if (!deleteTargetComment) return;

    startCommentDeleting(async () => {
      const res = await deleteAdminCommentAction(deleteTargetComment.id);

      if (!res.success) {
        toast("Nao foi possivel apagar comentario", {
          description: res.error ?? "Tente novamente.",
          variant: "error",
        });
        return;
      }

      toast("Comentario removido", {
        description: "O comentario foi apagado com sucesso.",
        variant: "success",
      });

      setDeleteTargetComment(null);
      fetchComments();
    });
  }

  const statTiles = [
    {
      label: "Total de Alunos",
      icon: MdPeople,
      value: statsLoading ? "—" : (stats?.users?.students ?? "—"),
    },
    {
      label: "Aulas Ativas",
      icon: MdPlayCircle,
      value: statsLoading ? "—" : (stats?.lessons?.active ?? "—"),
    },
    {
      label: "Comentarios na plataforma",
      icon: MdOutlineForum,
      value: commentStats.total,
    },
    {
      label: "Cursos Publicados",
      icon: MdOutlineSchool,
      value: statsLoading ? "—" : (stats?.courses?.published ?? "—"),
    },
  ];

  const tabClass = (isActive: boolean) =>
    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
      isActive
        ? "bg-ink text-white"
        : "text-ink/70 hover:bg-ink/5 hover:text-ink"
    }`;

  const iconBtn =
    "inline-flex size-9 items-center justify-center rounded-full text-ink/60 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none";

  return (
    <div className="bg-surface flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-ink text-2xl font-semibold text-balance">
              Bem-vindo ao seu painel, {displayName}!
            </h1>
            <p className="text-ink/70 mt-1 max-w-prose">
              {user?.role === "instructor"
                ? "Aqui você acompanha os cursos e comentários dos alunos."
                : "Aqui você acompanha cursos e comentários dos alunos em um único lugar."}
            </p>
          </div>
          {/* Botão de criar curso só para admin */}
          {isAdmin && (
            <Link
              href="/admin/cursos/criar"
              className="bg-accent text-accent-ink hover:bg-accent-500 focus-visible:ring-accent inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
            >
              <MdAddCircleOutline size={20} aria-hidden="true" />
              Adicionar Novo Curso
            </Link>
          )}
        </div>

        {/* Stats tiles */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.label}
                className="rounded-bento-md bg-surface-soft p-6"
              >
                <div className="bg-ink/5 text-ink/70 mb-5 inline-flex size-10 items-center justify-center rounded-full">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <p className="text-ink/70 text-sm font-medium">{tile.label}</p>
                <p className="text-ink mt-1 text-3xl font-semibold tabular-nums">
                  {tile.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Seções do painel"
          className="bg-surface-soft mb-4 inline-flex gap-1 rounded-full p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            className={tabClass(activeTab === "overview")}
          >
            Visao geral
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "comments"}
            onClick={() => setActiveTab("comments")}
            className={tabClass(activeTab === "comments")}
          >
            <MdOutlineChat size={16} aria-hidden="true" />
            Comentarios (admin)
          </button>
        </div>

        {activeTab === "overview" ? (
          <div className="rounded-bento-lg bg-surface-soft overflow-hidden">
            <div className="border-ink/10 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
              <h2 className="text-ink font-semibold">Cursos Cadastrados</h2>
              <Link
                href="/admin/cursos/gerenciar"
                className="text-accent-ink focus-visible:ring-accent decoration-accent rounded text-sm font-semibold underline decoration-2 underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
              >
                Ver todos →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="bg-ink/5 text-ink/70 text-xs font-semibold">
                    <th className="px-6 py-3.5">Nome do Curso</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Criado em</th>
                    {isAdmin && <th className="px-6 py-3.5 text-center">Acoes</th>}
                  </tr>
                </thead>
                <tbody className="divide-ink/10 divide-y text-sm">
                  {coursesLoading &&
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><div className="shimmer h-3 w-48 rounded" /></td>
                        <td className="px-6 py-4"><div className="shimmer h-5 w-20 rounded-full" /></td>
                        <td className="px-6 py-4"><div className="shimmer h-3 w-24 rounded" /></td>
                        {isAdmin && <td className="px-6 py-4"><div className="shimmer mx-auto h-7 w-20 rounded" /></td>}
                      </tr>
                    ))}

                  {!coursesLoading && courses.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 4 : 3} className="text-ink/70 px-6 py-10 text-center">
                        Nenhum curso cadastrado ainda.
                      </td>
                    </tr>
                  )}

                  {!coursesLoading &&
                    courses.map((course) => (
                      <tr key={course.id} className="hover:bg-ink/[0.03]">
                        <td className="px-6 py-4">
                          <span className="text-ink font-semibold">{course.title}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              course.is_published
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-ink/10 text-ink/70"
                            }`}
                          >
                            {course.is_published ? "Publicado" : "Rascunho"}
                          </span>
                        </td>
                        <td className="text-ink/70 px-6 py-4">
                          {new Date(course.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <Link
                                href={`/admin/cursos/${course.id}/editar`}
                                className={`${iconBtn} hover:bg-ink/5 hover:text-ink`}
                                aria-label={`Editar curso ${course.title}`}
                              >
                                <MdEdit size={18} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setSelectedCourse(course)}
                                className={`${iconBtn} hover:bg-red-50 hover:text-red-700`}
                                aria-label={`Excluir curso ${course.title}`}
                              >
                                <MdDeleteOutline size={18} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-bento-lg bg-surface-soft overflow-hidden">
            <div className="border-ink/10 flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
              <div>
                <h2 className="text-ink font-semibold">Comentarios das aulas</h2>
                <p className="text-ink/70 text-xs">
                  Esta aba foi criada para moderacao e exclusao de comentarios.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <MdSearch
                  size={18}
                  aria-hidden="true"
                  className="text-ink/50 absolute top-1/2 left-3.5 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={commentSearch}
                  onChange={(event) => setCommentSearch(event.target.value)}
                  placeholder="Buscar por aula, aluno ou texto..."
                  aria-label="Buscar comentarios"
                  className="border-ink/15 text-ink placeholder:text-ink/60 focus:ring-accent w-full rounded-full border bg-white py-2.5 pr-4 pl-10 text-sm outline-none focus:border-transparent focus:ring-2"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr className="bg-ink/5 text-ink/70 text-xs font-semibold">
                    <th className="px-6 py-3.5">Aula</th>
                    <th className="px-6 py-3.5">Comentario</th>
                    <th className="px-6 py-3.5">Aluno</th>
                    <th className="px-6 py-3.5">Data</th>
                    <th className="px-6 py-3.5 text-center">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-ink/10 divide-y text-sm">
                  {commentLoading &&
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4"><div className="shimmer h-3 w-36 rounded" /></td>
                        <td className="px-6 py-4"><div className="shimmer h-3 w-64 rounded" /></td>
                        <td className="px-6 py-4"><div className="shimmer h-3 w-28 rounded" /></td>
                        <td className="px-6 py-4"><div className="shimmer h-3 w-32 rounded" /></td>
                        <td className="px-6 py-4"><div className="shimmer mx-auto h-7 w-36 rounded" /></td>
                      </tr>
                    ))}

                  {!commentLoading && comments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-ink/70 px-6 py-10 text-center">
                        Nenhum comentario encontrado para os filtros atuais.
                      </td>
                    </tr>
                  )}

                  {!commentLoading &&
                    comments.map((comment) => (
                      <tr key={comment.id} className="hover:bg-ink/[0.03]">
                        <td className="px-6 py-4">
                          <p className="text-ink font-semibold">
                            {comment.lesson?.title ?? "Aula nao identificada"}
                          </p>
                          <p className="text-ink/70 text-xs">
                            {comment.lesson?.module?.course?.title ?? "Curso nao informado"}
                          </p>
                        </td>
                        <td className="text-ink/85 max-w-[360px] px-6 py-4">
                          <p className="line-clamp-3">{comment.content}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-ink font-semibold">{comment.user?.name ?? "Usuario"}</p>
                          <p className="text-ink/70 text-xs">{comment.user?.role ?? "student"}</p>
                        </td>
                        <td className="text-ink/70 px-6 py-4">
                          {comment.created_at
                            ? new Date(comment.created_at).toLocaleString("pt-BR")
                            : "Sem data"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleGoToUser(comment)}
                              className="border-ink/15 text-ink/80 hover:bg-ink/5 focus-visible:ring-accent rounded-full border bg-white px-3 py-1.5 text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none"
                            >
                              Perfil do aluno
                            </button>
                            <button
                              type="button"
                              disabled
                              className="bg-ink/5 text-ink/60 inline-flex cursor-not-allowed items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                              title="Responder comentario sera implementado em proxima etapa"
                            >
                              <MdOutlineReply size={14} aria-hidden="true" />
                              Responder (em breve)
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTargetComment(comment)}
                              className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:outline-none"
                            >
                              Deletar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <footer className="border-ink/10 text-ink/70 flex flex-wrap items-center justify-between gap-3 border-t p-4 text-sm">
              <span>
                Exibindo {commentMeta.from ?? 0} - {commentMeta.to ?? 0} de {commentMeta.total} comentarios
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCommentPage((p) => Math.max(1, p - 1))}
                  disabled={commentPage === 1 || commentLoading}
                  aria-label="Pagina anterior"
                  className="border-ink/15 text-ink/80 hover:bg-ink/5 focus-visible:ring-accent rounded-full border bg-white px-3.5 py-1.5 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                >
                  &lt;
                </button>
                <span
                  aria-current="page"
                  className="bg-ink rounded-full px-3.5 py-1.5 font-semibold text-white"
                >
                  {commentMeta.current_page}
                </span>
                <button
                  onClick={() =>
                    setCommentPage((p) => Math.min(commentMeta.last_page, p + 1))
                  }
                  disabled={commentPage >= commentMeta.last_page || commentLoading}
                  aria-label="Proxima pagina"
                  className="border-ink/15 text-ink/80 hover:bg-ink/5 focus-visible:ring-accent rounded-full border bg-white px-3.5 py-1.5 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                >
                  &gt;
                </button>
              </div>
            </footer>
          </div>
        )}
      </main>

      <DeleteConfirmModal
        open={Boolean(selectedCourse)}
        label={selectedCourse?.title ?? ""}
        title="Excluir curso"
        description="Deseja mesmo excluir este curso? Esta ação é irreversível."
        confirmLabel={courseDeleting ? "Excluindo..." : "Sim, excluir"}
        onCancel={() => setSelectedCourse(null)}
        onConfirm={handleDeleteCourse}
      />

      <DeleteConfirmModal
        open={Boolean(deleteTargetComment)}
        label={deleteTargetComment?.content.slice(0, 60) ?? ""}
        title="Deletar comentario"
        description="Deseja mesmo apagar este comentario da aula?"
        confirmLabel={commentDeleting ? "Deletando..." : "Sim, deletar"}
        onCancel={() => setDeleteTargetComment(null)}
        onConfirm={handleDeleteComment}
      />
    </div>
  );
}
