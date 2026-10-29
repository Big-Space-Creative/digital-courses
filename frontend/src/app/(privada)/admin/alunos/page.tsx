"use client";

import { useRef, useState, useEffect, useTransition, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/Toast";
import {
  listUsersAction,
  updateUserRoleAction,
  updateUserSubscriptionAction,
  updateUserDetailsAction,
  deleteUserAction,
  type ApiUser,
  type UserRole,
  type SubscriptionType,
  type UsersPaginated,
} from "@/app/actions/users";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataList } from "@/components/ui/DataList";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const roleLabel: Record<UserRole, string> = {
  student: "Aluno",
  instructor: "Instrutor",
  admin: "Admin",
};

type EditModalProps = {
  user: ApiUser;
  onClose: () => void;
  onSaved: (updated: ApiUser) => void;
  initialRole?: UserRole;
  initialSubscription?: SubscriptionType;
};

function EditUserModal({
  user,
  onClose,
  onSaved,
  initialRole,
  initialSubscription,
}: EditModalProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(initialRole ?? user.role);
  const [subscription, setSubscription] = useState<SubscriptionType>(
    initialSubscription ?? user.subscription_type ?? "free",
  );

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  function handleSave() {
    setSubmitted(true);
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return;
    setError("");
    startTransition(async () => {
      // 1) Atualizar nome e e-mail se mudaram
      const nameChanged = name.trim() !== user.name;
      const emailChanged = email.trim() !== user.email;
      if (nameChanged || emailChanged) {
        const detailsRes = await updateUserDetailsAction(user.id, {
          ...(nameChanged && { name: name.trim() }),
          ...(emailChanged && { email: email.trim() }),
        });
        if (!detailsRes.success) {
          setError(detailsRes.error ?? "Não foi possível salvar os dados.");
          toast("Erro ao atualizar dados", {
            description: detailsRes.error ?? "Tente novamente",
            variant: "error",
          });
          return;
        }
      }

      // 2) Atualizar role se mudou
      if (role !== user.role) {
        const res = await updateUserRoleAction(user.id, role);
        if (!res.success) {
          setError(
            res.error ??
              "Não foi possível salvar todas as alterações. Revise os dados e tente novamente.",
          );
          toast("Erro ao atualizar tipo", {
            description: res.error ?? "Tente novamente",
            variant: "error",
          });
          return;
        }
      }

      // 3) Atualizar subscription se é student e mudou
      if (
        role === "student" &&
        subscription !== (user.subscription_type ?? "free")
      ) {
        const res = await updateUserSubscriptionAction(user.id, subscription);
        if (!res.success) {
          setError(
            res.error ??
              "Não foi possível salvar todas as alterações. Revise os dados e tente novamente.",
          );
          toast("Erro ao atualizar plano", {
            description: res.error ?? "Tente novamente",
            variant: "error",
          });
          return;
        }
      }

      toast("Usuário atualizado", {
        description: `${name} foi atualizado com sucesso.`,
        variant: "success",
      });

      onSaved({
        ...user,
        name: name.trim(),
        email: email.trim(),
        role,
        subscription_type:
          role === "student" ? subscription : user.subscription_type,
      });
    });
  }

  return (
    <Dialog
      open
      onClose={() => {
        if (!isPending) onClose();
      }}
      title="Editar usuário"
      description={`${user.name} · ${user.email}`}
    >
      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSave();
        }}
        noValidate
      >
        <Input
          label="Nome completo"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isPending}
          error={submitted && !name.trim() ? "Informe o nome." : undefined}
        />
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isPending}
          error={
            submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
              ? "Informe um e-mail válido."
              : undefined
          }
        />
        <Select
          label="Permissão"
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
          disabled={isPending}
        >
          {(["student", "instructor", "admin"] as UserRole[]).map((value) => (
            <option key={value} value={value}>
              {roleLabel[value]}
            </option>
          ))}
        </Select>
        {role === "student" && (
          <Select
            label="Plano do aluno"
            value={subscription}
            onChange={(event) =>
              setSubscription(event.target.value as SubscriptionType)
            }
            disabled={isPending}
          >
            <option value="free">Gratuito</option>
            <option value="premium">Premium</option>
          </Select>
        )}
        {error && (
          <p role="alert" className="text-danger text-sm">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2 pt-3">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" loading={isPending}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export default function StudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, startLoading] = useTransition();
  const [error, setError] = useState("");
  const [suggestedRole, setSuggestedRole] = useState<UserRole>();
  const [suggestedPlan, setSuggestedPlan] = useState<SubscriptionType>();
  const [hasProcessedManageFromComment, setHasProcessedManageFromComment] =
    useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [page, setPage] = useState(1);
  const requestSequence = useRef(0);
  const [meta, setMeta] = useState<Omit<UsersPaginated, "data">>({
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
    per_page: 15,
    current_page: 1,
  });
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<ApiUser | null>(
    null,
  );
  const [isDeleting, startDeleting] = useTransition();

  // Debounce busca
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Busca via Server Action
  const fetchUsers = useCallback(() => {
    const request = ++requestSequence.current;
    startLoading(async () => {
      const result = await listUsersAction({
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        page,
        perPage: 15,
      });

      if (request !== requestSequence.current) return;

      if (!result.success) {
        setError(result.error);
        toast("Erro ao carregar usuários", {
          description: result.error,
          variant: "error",
        });
        return;
      }

      const { data, ...pageMeta } = result.data;
      setError("");
      setUsers(data);
      setHasLoaded(true);
      setMeta(pageMeta);
    });
  }, [debouncedSearch, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (hasProcessedManageFromComment || loading || users.length === 0) return;

    const userIdParam = searchParams.get("manageFromComment");
    if (!userIdParam) return;

    const userId = Number(userIdParam);
    if (!Number.isFinite(userId)) return;

    const target = users.find((user) => user.id === userId);
    if (!target) return;

    const targetRole =
      (searchParams.get("targetRole") as UserRole | null) ?? target.role;
    const targetPlan =
      (searchParams.get("targetPlan") as SubscriptionType | null) ??
      target.subscription_type ??
      "free";

    // Wait for the navigation frame before opening the native dialog so focus
    // is restored to a mounted page control when the dialog closes.
    const frame = requestAnimationFrame(() => {
      setHasProcessedManageFromComment(true);

      setSuggestedRole(
        ["student", "instructor", "admin"].includes(targetRole)
          ? targetRole
          : target.role,
      );
      setSuggestedPlan(
        ["free", "premium"].includes(targetPlan)
          ? targetPlan
          : (target.subscription_type ?? "free"),
      );
      setEditingUser(target);
      router.replace("/admin/alunos");
    });
    return () => cancelAnimationFrame(frame);
  }, [
    fetchUsers,
    hasProcessedManageFromComment,
    loading,
    router,
    searchParams,
    users,
  ]);

  function handleUserSaved(updated: ApiUser) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setEditingUser(null);
  }

  function handleConfirmDelete() {
    if (!deleteTargetUser) return;
    const target = deleteTargetUser;

    startDeleting(async () => {
      const res = await deleteUserAction(target.id);
      if (!res.success) {
        toast("Erro ao excluir usuário", {
          description: res.error ?? "Tente novamente.",
          variant: "error",
        });
        return;
      }
      toast("Usuário excluído", {
        description: `${target.name} foi removido da plataforma.`,
        variant: "success",
      });
      setDeleteTargetUser(null);
      if (users.length === 1 && page > 1) setPage(page - 1);
      else fetchUsers();
    });
  }

  const premiumCount = users.filter(
    (u) => u.role === "student" && u.subscription_type === "premium",
  ).length;
  const freeCount = users.filter(
    (u) => u.role === "student" && u.subscription_type === "free",
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Gestão de usuários"
        description="Gerencie os dados, as permissões e os planos dos usuários."
        actions={
          <Button variant="secondary" loading={loading} onClick={fetchUsers}>
            Atualizar
          </Button>
        }
      />
      <section className="border-border bg-panel rounded-2xl border p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <Input
            label="Buscar usuários"
            type="search"
            value={search}
            placeholder="Nome ou e-mail"
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            label="Filtrar por permissão"
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value as UserRole | "");
              setPage(1);
            }}
          >
            <option value="">Todas as permissões</option>
            <option value="student">Aluno</option>
            <option value="instructor">Instrutor</option>
            <option value="admin">Administrador</option>
          </Select>
        </div>
        <dl className="border-border mt-5 grid grid-cols-3 gap-3 border-t pt-4">
          <div>
            <dt className="text-text-muted text-xs">
              {debouncedSearch || roleFilter ? "Resultados" : "Usuários"}
            </dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">
              {loading || !hasLoaded ? "—" : meta.total}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted text-xs">Premium nesta página</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">
              {loading || !hasLoaded ? "—" : premiumCount}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted text-xs">Gratuitos nesta página</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">
              {loading || !hasLoaded ? "—" : freeCount}
            </dd>
          </div>
        </dl>
      </section>
      <section className="border-border bg-panel rounded-2xl border p-4 sm:p-5">
        <h2 className="mb-4 text-lg font-semibold">Usuários</h2>
        {error && (
          <ErrorState
            title={
              users.length
                ? "Lista possivelmente desatualizada"
                : "Não foi possível carregar os usuários"
            }
            description={error}
            onRetry={fetchUsers}
            loading={loading}
          />
        )}
        {loading && !users.length ? (
          <div aria-busy="true">
            <span className="sr-only">Carregando usuários</span>
            <Skeleton className="h-40" />
          </div>
        ) : (
          <DataList
            items={users}
            label="Usuários cadastrados"
            getKey={(item) => item.id}
            getItemLabel={(item) => `${item.name}, ${item.email}`}
            columns={[
              {
                key: "name",
                label: "Usuário",
                render: (item) => (
                  <>
                    <span className="flex items-center gap-3">
                      <span
                        className="bg-canvas flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold"
                        aria-hidden="true"
                      >
                        {item.avatar_url ? (
                          <Image
                            unoptimized
                            src={item.avatar_url}
                            width={36}
                            height={36}
                            alt=""
                            className="size-9 object-cover"
                          />
                        ) : (
                          item.name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()
                        )}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </span>
                    <span className="text-text-muted mt-1 block text-xs break-all">
                      {item.email}
                    </span>
                  </>
                ),
              },
              {
                key: "role",
                label: "Permissão",
                render: (item) => <Badge>{roleLabel[item.role]}</Badge>,
              },
              {
                key: "plan",
                label: "Plano",
                render: (item) =>
                  item.role === "student" ? (
                    <Badge
                      variant={
                        item.subscription_type === "premium"
                          ? "success"
                          : "neutral"
                      }
                    >
                      {item.subscription_type === "premium"
                        ? "Premium"
                        : "Gratuito"}
                    </Badge>
                  ) : (
                    "Não se aplica"
                  ),
              },
              {
                key: "date",
                label: "Cadastro",
                render: (item) => formatDate(item.created_at),
              },
            ]}
            actions={[
              {
                label: "Editar usuário",
                onClick: (item) => {
                  setSuggestedRole(undefined);
                  setSuggestedPlan(undefined);
                  setEditingUser(item);
                },
              },
              {
                label: "Excluir usuário",
                danger: true,
                onClick: setDeleteTargetUser,
                disabled: () => isDeleting,
              },
            ]}
            empty={
              error ? null : (
                <EmptyState
                  title={
                    debouncedSearch || roleFilter
                      ? "Nenhum usuário corresponde aos filtros"
                      : "Nenhum usuário cadastrado"
                  }
                  description="Os usuários cadastrados aparecerão aqui. Ajuste os filtros para ampliar a busca."
                />
              )
            }
          />
        )}
        <footer className="border-border text-text-muted mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm">
          <span role="status">
            {loading
              ? "Atualizando…"
              : `Exibindo ${meta.from ?? 0}–${meta.to ?? 0} de ${meta.total} usuários`}
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
      {editingUser && (
        <EditUserModal
          key={editingUser.id}
          user={editingUser}
          initialRole={suggestedRole}
          initialSubscription={suggestedPlan}
          onClose={() => setEditingUser(null)}
          onSaved={handleUserSaved}
        />
      )}
      <DeleteConfirmModal
        open={!!deleteTargetUser}
        title="Excluir usuário"
        label={
          deleteTargetUser
            ? `${deleteTargetUser.name} · ${deleteTargetUser.email}`
            : ""
        }
        pending={isDeleting}
        onCancel={() => setDeleteTargetUser(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
