"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { toast } from "@/components/ui/Toast";
import {
  listUsersAction,
  updateUserRoleAction,
  updateUserSubscriptionAction,
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
} from "react-icons/md";

// ─── Helpers visuais ──────────────────────────────────────────────────────────

const gradients = [
  "from-amber-300 to-orange-500",
  "from-cyan-300 to-blue-500",
  "from-pink-300 to-rose-500",
  "from-green-300 to-emerald-500",
  "from-violet-300 to-purple-500",
  "from-yellow-300 to-amber-500",
  "from-teal-300 to-cyan-500",
  "from-red-300 to-rose-500",
];

function avatarGradient(id: number) {
  return gradients[id % gradients.length];
}

function initials(name: string) {
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
  student: "bg-blue-100 text-blue-600",
  instructor: "bg-violet-100 text-violet-600",
  admin: "bg-red-100 text-red-600",
};

// ─── Modal de Edição ──────────────────────────────────────────────────────────

type EditModalProps = {
  user: ApiUser;
  onClose: () => void;
  onSaved: (updated: ApiUser) => void;
};

function EditUserModal({ user, onClose, onSaved }: EditModalProps) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<UserRole>(user.role);
  const [subscription, setSubscription] = useState<SubscriptionType>(
    user.subscription_type ?? "free",
  );

  function handleSave() {
    startTransition(async () => {
      // 1) Atualizar role se mudou
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

      // 2) Atualizar subscription se é student e mudou
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
        description: `${user.name} foi atualizado com sucesso.`,
        variant: "success",
      });

      onSaved({
        ...user,
        role,
        subscription_type:
          role === "student" ? subscription : user.subscription_type,
      });
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${avatarGradient(user.id)}`}
            >
              {initials(user.name)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar modal"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Role */}
          <div>
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Tipo de usuário (Role)
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["student", "instructor", "admin"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-lg border py-2 text-sm font-semibold transition ${
                    role === r
                      ? "border-orange-400 bg-orange-50 text-orange-700"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
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
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Plano do aluno
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["free", "premium"] as SubscriptionType[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubscription(s)}
                    className={`rounded-lg border py-2 text-sm font-semibold capitalize transition ${
                      subscription === s
                        ? "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
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
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="bg-primary rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
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
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, startLoading] = useTransition();
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

  function handleUserSaved(updated: ApiUser) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setEditingUser(null);
  }

  const premiumCount = users.filter(
    (u) => u.role === "student" && u.subscription_type === "premium",
  ).length;
  const freeCount = users.filter(
    (u) => u.role === "student" && u.subscription_type === "free",
  ).length;

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Cabeçalho */}
        <section className="mb-7 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-secondary text-2xl font-bold">
              Gestão de Usuários
            </h1>
            <p className="mt-1 text-gray-500">
              Gerencie roles e planos de todos os usuários da plataforma.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
        </section>

        {/* Cards de stats */}
        <section className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 w-fit rounded-lg bg-blue-100 p-2 text-blue-600">
              <MdOutlinePeopleAlt size={22} />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              Total de Usuários
            </p>
            <p className="text-secondary mt-1 text-2xl font-bold">
              {loading ? "—" : meta.total.toLocaleString("pt-BR")}
            </p>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 w-fit rounded-lg bg-orange-100 p-2 text-orange-600">
              <MdCheckCircle size={22} />
            </div>
            <p className="text-sm font-semibold text-gray-500">Plano Premium</p>
            <p className="text-secondary mt-1 text-2xl font-bold">
              {loading ? "—" : premiumCount}
              {!loading && (
                <span className="ml-1 text-xs font-normal text-gray-400">
                  nesta página
                </span>
              )}
            </p>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 w-fit rounded-lg bg-slate-100 p-2 text-slate-500">
              <MdDoNotDisturbOn size={22} />
            </div>
            <p className="text-sm font-semibold text-gray-500">Plano Free</p>
            <p className="text-secondary mt-1 text-2xl font-bold">
              {loading ? "—" : freeCount}
              {!loading && (
                <span className="ml-1 text-xs font-normal text-gray-400">
                  nesta página
                </span>
              )}
            </p>
          </article>
        </section>

        {/* Tabela */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Filtros */}
          <header className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
            <label className="relative min-w-[200px] flex-1">
              <MdSearch
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-orange-500"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm text-gray-700 outline-none focus:border-orange-300"
              />
            </label>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as UserRole | "");
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-300"
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
                <tr className="bg-gray-100 text-xs font-semibold tracking-[0.12em] text-gray-500 uppercase">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Cadastrado em</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {/* Skeleton */}
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200" />
                          <div className="h-3 w-28 rounded bg-gray-200" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 w-36 rounded bg-gray-200" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 w-16 rounded-full bg-gray-200" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 w-16 rounded-full bg-gray-200" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 w-24 rounded bg-gray-200" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="mx-auto h-7 w-7 rounded-lg bg-gray-200" />
                      </td>
                    </tr>
                  ))}

                {/* Empty */}
                {!loading && users.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}

                {/* Rows */}
                {!loading &&
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/70">
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
                              className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${avatarGradient(user.id)}`}
                            >
                              {initials(user.name)}
                            </div>
                          )}
                          <span className="font-semibold text-gray-800">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">{user.email}</td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${roleBadge[user.role]}`}
                        >
                          {roleLabel[user.role]}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {user.role === "student" ? (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              user.subscription_type === "premium"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {user.subscription_type === "premium"
                              ? "Premium"
                              : "Free"}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(user.created_at)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setEditingUser(user)}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-orange-50 hover:text-orange-600"
                            aria-label={`Editar usuário ${user.name}`}
                          >
                            <MdOutlineEdit size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 p-4 text-sm text-gray-500">
            <span>
              {loading
                ? "Carregando…"
                : `Exibindo ${meta.from ?? 0}–${meta.to ?? 0} de ${meta.total.toLocaleString("pt-BR")} usuários`}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                  className={`rounded-lg px-3 py-1.5 ${
                    p === page
                      ? "bg-orange-500 font-semibold text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              {meta.last_page > 5 && (
                <span className="px-1 text-gray-400">…</span>
              )}

              <button
                onClick={() =>
                  setPage((p) => Math.min(meta.last_page, p + 1))
                }
                disabled={page === meta.last_page || loading}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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
    </div>
  );
}
