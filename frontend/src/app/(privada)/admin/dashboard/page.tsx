"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataList } from "@/components/ui/DataList";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { toast } from "@/components/ui/Toast";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import {
  deleteCourseAction,
  getDashboardStatsAction,
  listCoursesAction,
  type ApiCourse,
  type DashboardStats,
} from "@/app/actions/courses";
import {
  deleteAdminCommentAction,
  listAdminCommentsAction,
  type LessonComment,
} from "@/app/actions/comments";
export default function Dashboard() {
  const router = useRouter();
  const { user } = useUser();
  const isAdmin = user?.role === "admin";
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [courseError, setCourseError] = useState("");
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [commentError, setCommentError] = useState("");
  const [commentLoading, setCommentLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, last_page: 1, from: 0, to: 0 });
  const [commentTotal, setCommentTotal] = useState<number | null>(null);
  const [courseTarget, setCourseTarget] = useState<ApiCourse | null>(null);
  const [commentTarget, setCommentTarget] = useState<LessonComment | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const deleteLock = useRef(false);
  const commentRequest = useRef(0);
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const result = await getDashboardStatsAction();
    if (result.success) {
      setStats(result.data);
      setStatsError("");
    } else
      setStatsError(
        result.error || "Não foi possível carregar os indicadores.",
      );
    setStatsLoading(false);
  }, []);
  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    const result = await listCoursesAction({ perPage: 5, page: 1 });
    if (result.success) {
      setCourses(result.data.data);
      setCourseError("");
    } else setCourseError(result.error);
    setCoursesLoading(false);
  }, []);
  const loadComments = useCallback(async () => {
    const request = ++commentRequest.current;
    setCommentLoading(true);
    const result = await listAdminCommentsAction({
      search: query || undefined,
      page,
      perPage: 15,
    });
    if (request !== commentRequest.current) return;
    if (result.success) {
      setComments(result.data.data);
      setMeta(result.data);
      if (!query) setCommentTotal(result.data.total);
      setCommentError("");
    } else setCommentError(result.error);
    setCommentLoading(false);
  }, [query, page]);
  useEffect(() => {
    void loadStats();
    void loadCourses();
  }, [loadStats, loadCourses]);
  useEffect(() => {
    void loadComments();
  }, [loadComments]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);
  async function removeCourse() {
    if (!courseTarget || deleteLock.current) return;
    deleteLock.current = true;
    setDeleting(true);
    try {
      const result = await deleteCourseAction(courseTarget.id);
      if (!result.success) {
        toast("Erro ao excluir curso", {
          description: result.error,
          variant: "error",
        });
        return;
      }
      setCourseTarget(null);
      void loadCourses();
      void loadStats();
      toast("Curso excluído", { variant: "success" });
    } finally {
      deleteLock.current = false;
      setDeleting(false);
    }
  }
  async function removeComment() {
    if (!commentTarget || deleteLock.current) return;
    deleteLock.current = true;
    setDeleting(true);
    try {
      const result = await deleteAdminCommentAction(commentTarget.id);
      if (!result.success) {
        toast("Erro ao excluir comentário", {
          description: result.error,
          variant: "error",
        });
        return;
      }
      setCommentTarget(null);
      setCommentTotal((total) =>
        total === null ? null : Math.max(0, total - 1),
      );
      if (comments.length === 1 && page > 1) setPage(page - 1);
      else void loadComments();
      toast("Comentário excluído", { variant: "success" });
    } finally {
      deleteLock.current = false;
      setDeleting(false);
    }
  }
  const overview = (
    <section className="border-border bg-panel rounded-2xl border p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Cursos recentes</h2>
        <Link
          className="text-accent-text min-h-11 content-center rounded-xl text-sm font-medium underline underline-offset-4 focus-visible:outline-2"
          href="/admin/cursos/gerenciar"
        >
          Ver todos
        </Link>
      </div>
      {courseError && (
        <ErrorState
          title={
            courses.length
              ? "A lista pode estar desatualizada"
              : "Não foi possível carregar os cursos"
          }
          description={courseError}
          onRetry={() => void loadCourses()}
          loading={coursesLoading}
        />
      )}
      {coursesLoading && !courses.length ? (
        <div aria-busy="true">
          <span className="sr-only">Carregando cursos</span>
          <Skeleton className="h-32" />
        </div>
      ) : (
        <DataList
          items={courses}
          label="Cursos recentes"
          getKey={(item) => item.id}
          getItemLabel={(item) => item.title}
          columns={[
            {
              key: "title",
              label: "Curso",
              render: (item) => (
                <span className="font-medium">{item.title}</span>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (item) => (
                <Badge variant={item.is_published ? "success" : "neutral"}>
                  {item.is_published ? "Publicado" : "Rascunho"}
                </Badge>
              ),
            },
            {
              key: "date",
              label: "Criado em",
              render: (item) =>
                new Date(item.created_at).toLocaleDateString("pt-BR"),
            },
          ]}
          actions={
            isAdmin
              ? [
                  {
                    label: "Editar curso",
                    onClick: (item) =>
                      router.push(`/admin/cursos/${item.id}/editar`),
                  },
                  {
                    label: "Excluir curso",
                    danger: true,
                    onClick: setCourseTarget,
                  },
                ]
              : undefined
          }
          empty={
            courseError ? null : (
              <EmptyState
                title="Seu catálogo começa aqui"
                description="Os cursos cadastrados aparecerão nesta lista."
              />
            )
          }
        />
      )}
    </section>
  );
  const discussion = (
    <section className="border-border bg-panel rounded-2xl border p-4 sm:p-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Comentários das aulas</h2>
          <p className="text-text-muted mt-1 text-sm">
            Consulte o perfil do aluno e modere as conversas.
          </p>
        </div>
        <div className="w-full sm:w-80">
          <Input
            label="Buscar comentários"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Aula, aluno ou texto"
            type="search"
          />
        </div>
      </div>
      {commentError && (
        <ErrorState
          title={
            comments.length
              ? "Comentários possivelmente desatualizados"
              : "Não foi possível carregar os comentários"
          }
          description={commentError}
          onRetry={() => void loadComments()}
          loading={commentLoading}
        />
      )}
      {commentLoading && !comments.length ? (
        <div aria-busy="true">
          <span className="sr-only">Carregando comentários</span>
          <Skeleton className="h-40" />
        </div>
      ) : (
        <DataList
          items={comments}
          label="Comentários das aulas"
          getKey={(item) => item.id}
          getItemLabel={(item) =>
            `${item.user?.name ?? "Aluno"}: ${item.content.slice(0, 60)}`
          }
          columns={[
            {
              key: "lesson",
              label: "Aula",
              render: (item) => (
                <>
                  <span className="font-medium">
                    {item.lesson?.title ?? "Aula não identificada"}
                  </span>
                  <span className="text-text-muted mt-1 block text-xs">
                    {item.lesson?.module?.course?.title ??
                      "Curso não informado"}
                  </span>
                </>
              ),
            },
            {
              key: "content",
              label: "Comentário",
              render: (item) => (
                <span className="block max-w-prose break-words">
                  {item.content}
                </span>
              ),
            },
            {
              key: "user",
              label: "Aluno",
              render: (item) => (
                <>
                  <span>{item.user?.name ?? "Usuário"}</span>
                  <span className="text-text-muted mt-1 block text-xs">
                    {item.user?.role === "admin"
                      ? "Administrador"
                      : item.user?.role === "instructor"
                        ? "Instrutor"
                        : "Aluno"}
                  </span>
                </>
              ),
            },
            {
              key: "date",
              label: "Data",
              render: (item) =>
                item.created_at
                  ? new Date(item.created_at).toLocaleString("pt-BR")
                  : "Sem data",
            },
          ]}
          actions={[
            {
              label: "Perfil do aluno",
              disabled: (item) => !item.user?.id,
              onClick: (item) =>
                router.push(
                  `/admin/alunos?manageFromComment=${item.user!.id}&targetRole=${encodeURIComponent(item.user!.role ?? "student")}&targetPlan=${encodeURIComponent(item.user!.subscription_type ?? "free")}`,
                ),
            },
            {
              label: "Responder (em breve)",
              disabled: () => true,
              onClick: () => {},
            },
            {
              label: "Excluir comentário",
              danger: true,
              onClick: setCommentTarget,
            },
          ]}
          empty={
            commentError ? null : (
              <EmptyState
                title={
                  query
                    ? "Nenhum comentário corresponde à busca"
                    : "Nenhum comentário por enquanto"
                }
                description={
                  query
                    ? "Tente outro termo ou limpe a busca."
                    : "As conversas das aulas aparecerão aqui."
                }
              />
            )
          }
        />
      )}
      <footer className="border-border text-text-muted mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm">
        <span>
          {commentLoading
            ? "Atualizando…"
            : `Exibindo ${meta.from ?? 0}–${meta.to ?? 0} de ${meta.total} comentários`}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            disabled={page === 1 || commentLoading}
            onClick={() => setPage(page - 1)}
            aria-label="Página anterior de comentários"
          >
            Anterior
          </Button>
          <span aria-current="page">{page}</span>
          <Button
            variant="secondary"
            disabled={page >= meta.last_page || commentLoading}
            onClick={() => setPage(page + 1)}
            aria-label="Próxima página de comentários"
          >
            Próxima
          </Button>
        </div>
      </footer>
    </section>
  );
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Visão geral"
        description={`Olá, ${user?.name ?? "Usuário"}. Acompanhe seus cursos e as conversas dos alunos.`}
        actions={
          isAdmin ? (
            <Button onClick={() => router.push("/admin/cursos/criar")}>
              Novo curso
            </Button>
          ) : undefined
        }
      />
      {statsError && (
        <ErrorState
          title={
            stats
              ? "Indicadores possivelmente desatualizados"
              : "Indicadores indisponíveis"
          }
          description={statsError}
          onRetry={() => void loadStats()}
          loading={statsLoading}
        />
      )}
      <dl
        className="border-border bg-panel grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border p-4 sm:grid-cols-4 sm:p-5"
        aria-busy={statsLoading}
      >
        {[
          { label: "Alunos", value: stats?.users?.students },
          { label: "Aulas ativas", value: stats?.lessons?.active },
          { label: "Cursos publicados", value: stats?.courses?.published },
          { label: "Comentários", value: commentTotal },
        ].map((item) => (
          <div key={item.label}>
            <dt className="text-text-muted text-xs sm:text-sm">{item.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {item.value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
      <Tabs
        label="Seções do painel"
        items={[
          { value: "overview", label: "Visão geral", content: overview },
          { value: "comments", label: "Comentários", content: discussion },
        ]}
      />
      <DeleteConfirmModal
        open={!!courseTarget}
        label={courseTarget?.title ?? ""}
        title="Excluir curso"
        pending={deleting}
        onCancel={() => setCourseTarget(null)}
        onConfirm={() => void removeCourse()}
      />
      <DeleteConfirmModal
        open={!!commentTarget}
        label={
          commentTarget
            ? `${commentTarget.user?.name ?? "Aluno"}: ${commentTarget.content}`
            : ""
        }
        title="Excluir comentário"
        pending={deleting}
        onCancel={() => setCommentTarget(null)}
        onConfirm={() => void removeComment()}
      />
    </div>
  );
}
