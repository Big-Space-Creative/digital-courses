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
  getDashboardStatsAction,
  listCoursesAction,
  type ApiCourse,
  type CoursesPaginated,
  type DashboardStats,
} from "@/app/actions/courses";
import {
  MdAddCircleOutline,
  MdDeleteOutline,
  MdEdit,
  MdOutlineChat,
  MdOutlineForum,
  MdOutlinePeopleAlt,
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
  useEffect(() => {
    startCoursesLoading(async () => {
      const result = await listCoursesAction({ perPage: 5, page: 1 });
      if (result.success) setCourses(result.data.data);
    });
  }, []);

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

  return (
    <div className="bg-background flex min-h-screen flex-col font-sans">
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-secondary text-2xl font-bold">
              Bem-vindo ao seu painel, {displayName}!
            </h2>
            <p className="mt-1 text-gray-500">
              {user?.role === "instructor"
                ? "Aqui você acompanha os cursos e comentários dos alunos."
                : "Aqui você acompanha cursos e comentários dos alunos em um único lugar."}
            </p>
          </div>
          {/* Botão de criar curso só para admin */}
          {isAdmin && (
            <Link
              href="/admin/cursos/criar"
              className="bg-primary hover:bg-primary-dark inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors sm:w-auto"
            >
              <MdAddCircleOutline size={20} />
              Adicionar Novo Curso
            </Link>
          )}
        </div>

        {/* Stats cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="text-primary rounded-lg bg-orange-50 p-2">
                <MdPeople size={20} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Total de Alunos</p>
            <p className="text-secondary mt-1 text-2xl font-bold">
              {statsLoading ? "—" : (stats?.users?.students ?? "—")}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-500">
                <MdPlayCircle size={20} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Aulas Ativas</p>
            <p className="text-secondary mt-1 text-2xl font-bold">
              {statsLoading ? "—" : (stats?.lessons?.active ?? "—")}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-violet-50 p-2 text-violet-500">
                <MdOutlineForum size={20} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Comentarios na plataforma</p>
            <p className="text-secondary mt-1 text-2xl font-bold">{commentStats.total}</p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-500">
                <MdOutlineSchool size={20} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Cursos Publicados</p>
            <p className="text-secondary mt-1 text-2xl font-bold">
              {statsLoading ? "—" : (stats?.courses?.published ?? "—")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "overview"
                ? "border border-b-0 border-gray-200 bg-white text-secondary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Visao geral
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("comments")}
            className={`inline-flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "comments"
                ? "border border-b-0 border-gray-200 bg-white text-secondary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MdOutlineChat size={16} />
            Comentarios (admin)
          </button>
        </div>

        {activeTab === "overview" ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
              <h3 className="font-semibold text-gray-800">Cursos Cadastrados</h3>
              <Link
                href="/admin/cursos/gerenciar"
                className="text-sm font-semibold text-orange-600 hover:underline"
              >
                Ver todos →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="bg-gray-100 text-xs font-semibold tracking-[0.12em] text-gray-500 uppercase">
                    <th className="px-6 py-4">Nome do Curso</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Criado em</th>
                    {isAdmin && <th className="px-6 py-4 text-center">Acoes</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {coursesLoading &&
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-3 w-48 rounded bg-gray-200" /></td>
                        <td className="px-6 py-4"><div className="h-5 w-20 rounded-full bg-gray-200" /></td>
                        <td className="px-6 py-4"><div className="h-3 w-24 rounded bg-gray-200" /></td>
                        {isAdmin && <td className="px-6 py-4"><div className="mx-auto h-7 w-20 rounded bg-gray-200" /></td>}
                      </tr>
                    ))}

                  {!coursesLoading && courses.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 4 : 3} className="px-6 py-10 text-center text-gray-500">
                        Nenhum curso cadastrado ainda.
                      </td>
                    </tr>
                  )}

                  {!coursesLoading &&
                    courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50/70">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800">{course.title}</span>
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
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(course.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-4 text-gray-400">
                              <Link
                                href={`/admin/cursos/${course.id}/editar`}
                                className="hover:text-blue-500"
                                aria-label={`Editar curso ${course.title}`}
                              >
                                <MdEdit size={18} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setSelectedCourse(course)}
                                className="hover:text-red-500"
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
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
              <div>
                <h3 className="font-semibold text-gray-800">Comentarios das aulas</h3>
                <p className="text-xs text-gray-500">
                  Esta aba foi criada para moderacao e exclusao de comentarios.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <MdSearch
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={commentSearch}
                  onChange={(event) => setCommentSearch(event.target.value)}
                  placeholder="Buscar por aula, aluno ou texto..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm text-gray-700 outline-none focus:border-orange-300"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr className="bg-gray-100 text-xs font-semibold tracking-[0.12em] text-gray-500 uppercase">
                    <th className="px-6 py-4">Aula</th>
                    <th className="px-6 py-4">Comentario</th>
                    <th className="px-6 py-4">Aluno</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4 text-center">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {commentLoading &&
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-3 w-36 rounded bg-gray-200" /></td>
                        <td className="px-6 py-4"><div className="h-3 w-64 rounded bg-gray-200" /></td>
                        <td className="px-6 py-4"><div className="h-3 w-28 rounded bg-gray-200" /></td>
                        <td className="px-6 py-4"><div className="h-3 w-32 rounded bg-gray-200" /></td>
                        <td className="px-6 py-4"><div className="mx-auto h-7 w-36 rounded bg-gray-200" /></td>
                      </tr>
                    ))}

                  {!commentLoading && comments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        Nenhum comentario encontrado para os filtros atuais.
                      </td>
                    </tr>
                  )}

                  {!commentLoading &&
                    comments.map((comment) => (
                      <tr key={comment.id} className="hover:bg-gray-50/70">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            {comment.lesson?.title ?? "Aula nao identificada"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {comment.lesson?.module?.course?.title ?? "Curso nao informado"}
                          </p>
                        </td>
                        <td className="max-w-[360px] px-6 py-4 text-gray-700">
                          <p className="line-clamp-3">{comment.content}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">{comment.user?.name ?? "Usuario"}</p>
                          <p className="text-xs text-gray-500">{comment.user?.role ?? "student"}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {comment.created_at
                            ? new Date(comment.created_at).toLocaleString("pt-BR")
                            : "Sem data"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleGoToUser(comment)}
                              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              Perfil do aluno
                            </button>
                            <button
                              type="button"
                              disabled
                              className="inline-flex cursor-not-allowed items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700/70"
                              title="Responder comentario sera implementado em proxima etapa"
                            >
                              <MdOutlineReply size={14} />
                              Responder (em breve)
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTargetComment(comment)}
                              className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
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

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 p-4 text-sm text-gray-500">
              <span>
                Exibindo {commentMeta.from ?? 0} - {commentMeta.to ?? 0} de {commentMeta.total} comentarios
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCommentPage((p) => Math.max(1, p - 1))}
                  disabled={commentPage === 1 || commentLoading}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  &lt;
                </button>
                <button className="rounded-lg bg-orange-500 px-3 py-1.5 font-semibold text-white">
                  {commentMeta.current_page}
                </button>
                <button
                  onClick={() =>
                    setCommentPage((p) => Math.min(commentMeta.last_page, p + 1))
                  }
                  disabled={commentPage >= commentMeta.last_page || commentLoading}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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
        confirmLabel="Sim, excluir"
        onCancel={() => setSelectedCourse(null)}
        onConfirm={() => setSelectedCourse(null)}
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
