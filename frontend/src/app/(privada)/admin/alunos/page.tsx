"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
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
import {
  MdCheckCircle,
  MdDoNotDisturbOn,
  MdOutlinePeopleAlt,
  MdSearch,
  MdOutlineEdit,
  MdClose,
  MdRefresh,
  MdDeleteOutline,
  MdOutlinePerson,
  MdEmail,
} from "react-icons/md";

// ─── Helpers visuais ──────────────────────────────────────────────────────────

const gradients = [
  "bg-orange-100 text-orange-900",
  "bg-sky-100 text-sky-900",
  "bg-rose-100 text-rose-900",
  "bg-emerald-100 text-emerald-900",
  "bg-violet-100 text-violet-900",
  "bg-amber-100 text-amber-900",
  "bg-teal-100 text-teal-900",
  "bg-stone-200 text-stone-800",
];

function avatarGradient(id: number) {
  return gradients[id % gradients.length];
}

function initials(name?: string | null) {
  if (!name) return "";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

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

const roleBadge: Record<UserRole, string> = {
  student: "bg-sky-100 text-sky-900",
  instructor: "bg-violet-100 text-violet-900",
  admin: "bg-red-100 text-red-800",
};

// ─── Modal de Edição ──────────────────────────────────────────────────────────

type EditModalProps = {
  user: ApiUser;
  onClose: () => void;
  onSaved: (updated: ApiUser) => void;
};

function EditUserModal({ user, onClose, onSaved }: EditModalProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [subscription, setSubscription] = useState<SubscriptionType>(
    user.subscription_type ?? "free",
  );

  function handleSave() {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div role="dialog" aria-modal="true" aria-label="Editar usuário" className="w-full max-w-md rounded-bento-lg bg-surface-soft shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${avatarGradient(user.id)}`}
            >
              {initials(user.name)}
            </div>
            <div>
              <p className="font-semibold text-ink">{user.name}</p>
              <p className="text-xs text-ink/70">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-2 text-ink/60 hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            aria-label="Fechar modal"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Nome */}
          <div>
            <p className="text-sm font-medium text-ink/80">Nome</p>
            <div className="mt-2 flex items-center gap-2 rounded-bento-md border border-ink/15 bg-white px-3.5 py-3 focus-within:border-transparent focus-within:ring-2 focus-within:ring-accent">
              <MdOutlinePerson size={16} className="text-ink/50" aria-hidden="true" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/60"
                placeholder="Nome do usuário"
              />
            </div>
          </div>

          {/* E-mail */}
          <div>
            <p className="text-sm font-medium text-ink/80">E-mail</p>
            <div className="mt-2 flex items-center gap-2 rounded-bento-md border border-ink/15 bg-white px-3.5 py-3 focus-within:border-transparent focus-within:ring-2 focus-within:ring-accent">
              <MdEmail size={16} className="text-ink/50" aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/60"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <p className="text-sm font-medium text-ink/80">
              Tipo de usuário (Role)
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["student", "instructor", "admin"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                  className={`rounded-full border py-2.5 text-sm font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                    role === r
                      ? "border-ink bg-ink text-white"
                      : "border-ink/15 bg-white text-ink/75 hover:bg-ink/5"
                  }`}
                >
                  {roleLabel[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Subscription — só para student */}
          {role === "student" && (
            <div>
              <p className="text-sm font-medium text-ink/80">
                Plano do aluno
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["free", "premium"] as SubscriptionType[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={subscription === s}
                    onClick={() => setSubscription(s)}
                    className={`rounded-full border py-2.5 text-sm font-semibold capitalize transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                      subscription === s
                        ? "border-ink bg-ink text-white"
                        : "border-ink/15 bg-white text-ink/75 hover:bg-ink/5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-ink/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="bg-accent text-accent-ink hover:bg-accent-500 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
          >
            {isPending ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function StudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, startLoading] = useTransition();
  const [isAutoManaging, startAutoManaging] = useTransition();
  const [hasProcessedManageFromComment, setHasProcessedManageFromComment] =
    useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<Omit<UsersPaginated, "data">>({
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
    per_page: 15,
    current_page: 1,
  });
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<ApiUser | null>(null);
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
    startLoading(async () => {
      const result = await listUsersAction({
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        page,
        perPage: 15,
      });

      if (!result.success) {
        toast("Erro ao carregar usuários", {
          description: result.error,
          variant: "error",
        });
        return;
      }

      const { data, ...pageMeta } = result.data;
      setUsers(data);
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

    const targetRole = (searchParams.get("targetRole") as UserRole | null) ?? target.role;
    const targetPlan =
      (searchParams.get("targetPlan") as SubscriptionType | null) ??
      target.subscription_type ??
      "free";

    setHasProcessedManageFromComment(true);

    startAutoManaging(async () => {
      const roleRes = await updateUserRoleAction(target.id, targetRole);

      if (!roleRes.success) {
        toast("Falha ao sincronizar role", {
          description: roleRes.error ?? "Nao foi possivel aplicar role do perfil comentador.",
          variant: "error",
        });
        router.replace("/admin/alunos");
        return;
      }

      if (targetRole === "student") {
        const subRes = await updateUserSubscriptionAction(target.id, targetPlan);
        if (!subRes.success) {
          toast("Falha ao sincronizar plano", {
            description: subRes.error ?? "Nao foi possivel aplicar plano do perfil comentador.",
            variant: "error",
          });
          router.replace("/admin/alunos");
          return;
        }
      }

      toast("Perfil do comentario carregado", {
        description:
          "Tipo de usuario e plano foram atualizados para este aluno. Voce pode revisar no modal.",
        variant: "success",
      });

      setEditingUser({
        ...target,
        role: targetRole,
        subscription_type: targetRole === "student" ? targetPlan : target.subscription_type,
      });

      fetchUsers();
      router.replace("/admin/alunos");
    });
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
    setDeleteTargetUser(null);

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
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
    });
  }

  const premiumCount = users.filter(
    (u) => u.role === "student" && u.subscription_type === "premium",
  ).length;
  const freeCount = users.filter(
    (u) => u.role === "student" && u.subscription_type === "free",
  ).length;

  return (
    <div className="bg-surface min-h-screen">
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Cabeçalho */}
        <section className="mb-7 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-ink text-2xl font-semibold">
              Gestão de Usuários
            </h1>
            <p className="mt-1 text-ink/70">
              Gerencie roles e planos de todos os usuários da plataforma.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading || isAutoManaging}
            className="flex items-center gap-2 rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:opacity-50"
          >
            <MdRefresh
              size={16}
              className={loading || isAutoManaging ? "animate-spin" : ""}
            />
            Atualizar
          </button>
        </section>

        {/* Cards de stats */}
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-bento-md bg-surface-soft p-6">
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-full bg-ink/5 text-ink/70">
              <MdOutlinePeopleAlt size={22} />
            </div>
            <p className="text-sm font-medium text-ink/70">
              Total de Usuários
            </p>
            <p className="text-ink mt-1 text-3xl font-semibold tabular-nums">
              {loading ? "—" : meta.total.toLocaleString("pt-BR")}
            </p>
          </article>

          <article className="rounded-bento-md bg-surface-soft p-6">
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-full bg-ink/5 text-ink/70">
              <MdCheckCircle size={22} />
            </div>
            <p className="text-sm font-medium text-ink/70">Plano Premium</p>
            <p className="text-ink mt-1 text-3xl font-semibold tabular-nums">
              {loading ? "—" : premiumCount}
              {!loading && (
                <span className="ml-1 text-xs font-normal text-ink/70">
                  nesta página
                </span>
              )}
            </p>
          </article>

          <article className="rounded-bento-md bg-surface-soft p-6">
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-full bg-ink/5 text-ink/70">
              <MdDoNotDisturbOn size={22} />
            </div>
            <p className="text-sm font-medium text-ink/70">Plano Free</p>
            <p className="text-ink mt-1 text-3xl font-semibold tabular-nums">
              {loading ? "—" : freeCount}
              {!loading && (
                <span className="ml-1 text-xs font-normal text-ink/70">
                  nesta página
                </span>
              )}
            </p>
          </article>
        </section>

        {/* Tabela */}
        <section className="overflow-hidden rounded-bento-lg bg-surface-soft">
          {/* Filtros */}
          <header className="flex flex-wrap items-center gap-3 border-b border-ink/10 p-4">
            <label className="relative min-w-[200px] flex-1">
              <MdSearch
                size={18}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/50"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                aria-label="Buscar usuários"
                className="w-full rounded-full border border-ink/15 bg-white py-2.5 pr-4 pl-10 text-sm text-ink outline-none placeholder:text-ink/60 focus:border-transparent focus:ring-2 focus:ring-accent"
              />
            </label>

            <select
              aria-label="Filtrar por tipo"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as UserRole | "");
                setPage(1);
              }}
              className="rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-transparent focus:ring-2 focus:ring-accent"
            >
              <option value="">Todos os tipos</option>
              <option value="student">Aluno</option>
              <option value="instructor">Instrutor</option>
              <option value="admin">Admin</option>
            </select>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="bg-ink/5 text-xs font-semibold text-ink/70">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Cadastrado em</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ink/10 text-sm">
                {/* Skeleton */}
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full shimmer" />
                          <div className="h-3 w-28 rounded shimmer" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 w-36 rounded shimmer" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 w-16 rounded-full shimmer" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 w-16 rounded-full shimmer" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 w-24 rounded shimmer" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="mx-auto h-7 w-7 rounded-lg shimmer" />
                      </td>
                    </tr>
                  ))}

                {/* Empty */}
                {!loading && users.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-ink/70"
                    >
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}

                {/* Rows */}
                {!loading &&
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-ink/[0.03]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${avatarGradient(user.id)}`}
                            >
                              {initials(user.name)}
                            </div>
                          )}
                          <span className="font-semibold text-ink">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-ink/80">{user.email}</td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadge[user.role]}`}
                        >
                          {roleLabel[user.role]}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {user.role === "student" ? (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              user.subscription_type === "premium"
                                ? "bg-orange-100 text-orange-900"
                                : "bg-ink/10 text-ink/75"
                            }`}
                          >
                            {user.subscription_type === "premium"
                              ? "Premium"
                              : "Free"}
                          </span>
                        ) : (
                          <span className="text-ink/60">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-ink/70">
                        {formatDate(user.created_at)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingUser(user)}
                            className="inline-flex size-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                            aria-label={`Editar usuário ${user.name}`}
                            title="Editar usuário"
                          >
                            <MdOutlineEdit size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetUser(user)}
                            className="inline-flex size-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:outline-none"
                            aria-label={`Excluir usuário ${user.name}`}
                            title="Excluir usuário"
                          >
                            <MdDeleteOutline size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 p-4 text-sm text-ink/70">
            <span>
              {loading
                ? "Carregando…"
                : `Exibindo ${meta.from ?? 0}–${meta.to ?? 0} de ${meta.total.toLocaleString("pt-BR")} usuários`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                aria-label="Página anterior"
                className="rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-ink/80 hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                &lt;
              </button>

              {Array.from(
                { length: Math.min(5, meta.last_page) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  disabled={loading}
                  aria-current={p === page ? "page" : undefined}
                  className={`rounded-full px-3.5 py-1.5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                    p === page
                      ? "bg-ink font-semibold text-white"
                      : "border border-ink/15 bg-white text-ink/80 hover:bg-ink/5"
                  }`}
                >
                  {p}
                </button>
              ))}

              {meta.last_page > 5 && (
                <span className="px-1 text-ink/60">…</span>
              )}

              <button
                onClick={() =>
                  setPage((p) => Math.min(meta.last_page, p + 1))
                }
                disabled={page === meta.last_page || loading}
                aria-label="Próxima página"
                className="rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-ink/80 hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                &gt;
              </button>
            </div>
          </footer>
        </section>
      </main>

      {/* Modal de edição */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={handleUserSaved}
        />
      )}

      {/* Modal de exclusão */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="del-user-title" className="w-full max-w-sm rounded-bento-lg bg-surface-soft p-6 shadow-xl">
            <h3 id="del-user-title" className="text-lg font-semibold text-ink">Excluir usuário?</h3>
            <p className="mt-2 text-sm text-ink/75">
              Você está prestes a excluir{" "}
              <strong>{deleteTargetUser.name}</strong>. Esta ação não poderá ser desfeita.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                disabled={isDeleting}
                className="rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
              >
                {isDeleting ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
