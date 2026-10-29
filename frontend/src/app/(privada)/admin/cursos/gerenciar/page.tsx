"use client";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataList } from "@/components/ui/DataList";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";

import { useRef, useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ManageCoursesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [error, setError] = useState("");
  const [featuredError, setFeaturedError] = useState("");
  const [featuredCourse, setFeaturedCourse] = useState<ApiCourse | null>(null);
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
  const requestSequence = useRef(0);
  const [deleteTarget, setDeleteTarget] = useState<ApiCourse | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCourses = useCallback(() => {
    const request = ++requestSequence.current;
    startLoading(async () => {
      const [coursesResult, featuredResult] = await Promise.all([
        listCoursesAction({
          search: debouncedSearch || undefined,
          page,
          perPage: 15,
        }),
        getFeaturedCourseAction(),
      ]);

      if (request !== requestSequence.current) return;

      if (featuredResult.success) {
        setFeaturedCourse(featuredResult.data);
        setFeaturedError("");
        setFeaturedCourseId(featuredResult.data.id);
      } else if (
        featuredResult.error === "Nenhum curso publicado disponivel ainda."
      ) {
        setFeaturedCourse(null);
        setFeaturedCourseId(null);
        setFeaturedError("");
      } else setFeaturedError(featuredResult.error);
      if (!coursesResult.success) {
        setError(coursesResult.error);
        toast("Erro ao carregar cursos", {
          description: coursesResult.error,
          variant: "error",
        });
        return;
      }

      const { data, ...pageMeta } = coursesResult.data;
      setError("");
      setCourses(data);
      setMeta(pageMeta);
    });
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;

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

      setDeleteTarget(null);
      if (courses.length === 1 && page > 1) setPage(page - 1);
      else fetchCourses();

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
          ? `"${course.title}" está publicado na área do aluno.`
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
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Gerenciar cursos"
        description="Organize o catálogo e controle o que aparece na área do aluno."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              loading={loading}
              onClick={fetchCourses}
            >
              Atualizar
            </Button>
            {isAdmin && (
              <Button onClick={() => router.push("/admin/cursos/criar")}>
                Novo curso
              </Button>
            )}
          </div>
        }
      />
      <section
        className="border-border bg-panel rounded-2xl border p-4 sm:p-5"
        aria-label="Curso em destaque"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-text-muted text-sm font-medium">
              Curso em destaque
            </h2>
            {featuredCourse ? (
              <>
                <p className="mt-2 text-lg font-semibold">
                  {featuredCourse.title}
                </p>
                <p className="text-text-muted mt-1 text-sm">
                  Exibido na área do aluno.
                </p>
              </>
            ) : !featuredError ? (
              <p className="text-text-muted mt-2 text-sm">
                Nenhum curso em destaque no momento.
              </p>
            ) : null}
          </div>
          {featuredCourse && (
            <Badge variant="success">Exibido na área do aluno</Badge>
          )}
        </div>
        {featuredError && (
          <ErrorState
            title="Não foi possível atualizar o destaque"
            description={featuredError}
            onRetry={fetchCourses}
            loading={loading}
          />
        )}
      </section>
      <section className="border-border bg-panel rounded-2xl border p-4 sm:p-5">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-lg font-semibold">
            Catálogo{" "}
            <span className="text-text-muted text-sm font-normal">
              ({meta.total}
              {debouncedSearch ? " resultados" : " cursos"})
            </span>
          </h2>
          <div className="w-full sm:w-80">
            <Input
              label="Buscar cursos"
              type="search"
              placeholder="Título do curso"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        {error && (
          <ErrorState
            title={
              courses.length
                ? "Lista possivelmente desatualizada"
                : "Não foi possível carregar os cursos"
            }
            description={error}
            onRetry={fetchCourses}
            loading={loading}
          />
        )}
        {loading && !courses.length ? (
          <div aria-busy="true">
            <span className="sr-only">Carregando cursos</span>
            <Skeleton className="h-40" />
          </div>
        ) : (
          <DataList
            items={courses}
            label="Catálogo de cursos"
            getKey={(course) => course.id}
            getItemLabel={(course) => course.title}
            columns={[
              {
                key: "title",
                label: "Curso",
                render: (course) => (
                  <div className="flex min-w-0 items-center gap-3">
                    {course.thumbnail && (
                      <Image
                        unoptimized
                        width={320}
                        height={180}
                        src={course.thumbnail}
                        alt=""
                        className="size-11 shrink-0 rounded-xl object-cover"
                      />
                    )}
                    <span className="min-w-0">
                      <span className="block font-medium">{course.title}</span>
                      {course.description && (
                        <span className="text-text-muted mt-1 block max-w-prose text-xs">
                          {course.description}
                        </span>
                      )}
                      {course.id === featuredCourseId && (
                        <span className="text-accent-text mt-1 block text-xs">
                          Exibido na área do aluno
                        </span>
                      )}
                    </span>
                  </div>
                ),
              },
              {
                key: "modules",
                label: "Módulos",
                render: (course) => course.modules?.length ?? "—",
              },
              {
                key: "lessons",
                label: "Aulas",
                render: (course) => course.lessons_count ?? "—",
              },
              {
                key: "status",
                label: "Status",
                render: (course) => (
                  <Badge variant={course.is_published ? "success" : "neutral"}>
                    {course.is_published ? "Publicado" : "Rascunho"}
                  </Badge>
                ),
              },
              {
                key: "date",
                label: "Criado em",
                render: (course) => formatDate(course.created_at),
              },
            ]}
            actions={[
              {
                label: "Editar curso",
                onClick: (course) =>
                  router.push(`/admin/cursos/${course.id}/editar`),
                disabled: () => actionPending,
              },
              {
                label: "Alterar publicação",
                onClick: handleTogglePublish,
                disabled: () => actionPending,
              },
              {
                label: "Excluir curso",
                danger: true,
                onClick: setDeleteTarget,
                disabled: () => actionPending,
              },
            ]}
            empty={
              error ? null : (
                <EmptyState
                  title={
                    debouncedSearch
                      ? "Nenhum curso corresponde à busca"
                      : "Seu catálogo ainda está vazio"
                  }
                  description={
                    debouncedSearch
                      ? "Experimente outro termo ou limpe a busca."
                      : "Crie seu primeiro curso para organizar módulos e aulas."
                  }
                  action={
                    debouncedSearch ? (
                      <Button variant="secondary" onClick={() => setSearch("")}>
                        Limpar busca
                      </Button>
                    ) : isAdmin ? (
                      <Button
                        onClick={() => router.push("/admin/cursos/criar")}
                      >
                        Criar curso
                      </Button>
                    ) : undefined
                  }
                />
              )
            }
          />
        )}
        <footer className="border-border text-text-muted mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm">
          <span role="status">
            {loading
              ? "Atualizando…"
              : `Exibindo ${meta.from ?? 0}–${meta.to ?? 0} de ${meta.total} cursos`}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            {Array.from({ length: Math.min(5, meta.last_page) }, (_, index) => {
              const first = Math.max(1, Math.min(page - 2, meta.last_page - 4));
              const targetPage = first + index;
              return (
                <Button
                  key={targetPage}
                  variant={targetPage === page ? "primary" : "secondary"}
                  aria-current={targetPage === page ? "page" : undefined}
                  aria-label={`Ir para a página ${targetPage}`}
                  disabled={loading}
                  onClick={() => setPage(targetPage)}
                >
                  {targetPage}
                </Button>
              );
            })}
            <Button
              variant="secondary"
              disabled={page >= meta.last_page || loading}
              onClick={() => setPage(page + 1)}
            >
              Próxima
            </Button>
          </div>
        </footer>
      </section>
      <DeleteConfirmModal
        open={!!deleteTarget}
        label={deleteTarget?.title ?? ""}
        title="Excluir curso"
        description="Os módulos e as aulas associados também serão removidos."
        pending={actionPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
