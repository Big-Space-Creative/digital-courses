"use client";

import { useState, useTransition } from "react";
import { useUser } from "@/context/UserContext";
import { toast } from "@/components/ui/Toast";
import { changePasswordAction, updateProfileNameAction } from "@/app/actions/users";
import {
  MdEmail,
  MdLock,
  MdOutlinePerson,
  MdSecurity,
  MdCheckCircleOutline,
} from "react-icons/md";

function initials(name?: string | null) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function AdminProfilePage() {
  const { user, setUser } = useUser();

  const displayName = user?.name ?? "Usuário";
  const displayEmail = user?.email ?? "";
  const displayRole =
    user?.role === "admin"
      ? "Administrador"
      : user?.role === "instructor"
        ? "Instrutor"
        : "Membro";
  const memberSince = user
    ? new Date(user.createdAt ?? new Date()).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : "—";

  // ── Nome ─────────────────────────────────────────────────────────────────────
  const [name, setName] = useState(displayName);
  const [namePending, startNameTransition] = useTransition();

  function handleSaveName() {
    if (!name.trim() || name.trim() === user?.name) return;
    startNameTransition(async () => {
      const res = await updateProfileNameAction(name.trim());
      if (!res.success) {
        toast("Erro ao atualizar nome", {
          description: res.error ?? "Tente novamente.",
          variant: "error",
        });
        return;
      }
      toast("Nome atualizado", {
        description: "Seu nome foi alterado com sucesso.",
        variant: "success",
      });
      if (user) setUser({ ...user, name: name.trim() });
    });
  }

  // ── Senha ─────────────────────────────────────────────────────────────────────
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordPending, startPasswordTransition] = useTransition();

  function handleSavePassword() {
    if (!password || !passwordConfirm) {
      toast("Campos obrigatórios", {
        description: "Preencha a nova senha e a confirmação.",
        variant: "error",
      });
      return;
    }
    if (password !== passwordConfirm) {
      toast("Senhas não conferem", {
        description: "A nova senha e a confirmação precisam ser iguais.",
        variant: "error",
      });
      return;
    }
    if (password.length < 8) {
      toast("Senha muito curta", {
        description: "A senha precisa ter no mínimo 8 caracteres.",
        variant: "error",
      });
      return;
    }

    startPasswordTransition(async () => {
      const res = await changePasswordAction({
        password,
        password_confirmation: passwordConfirm,
      });
      if (!res.success) {
        toast("Erro ao atualizar senha", {
          description: res.error ?? "Tente novamente.",
          variant: "error",
        });
        return;
      }
      toast("Senha atualizada", {
        description: "Sua senha foi alterada com sucesso.",
        variant: "success",
      });
      setPassword("");
      setPasswordConfirm("");
    });
  }

  const fieldWrap =
    "mt-2 flex items-center gap-2 rounded-bento-md border border-ink/15 bg-white px-3.5 py-3 text-ink focus-within:border-transparent focus-within:ring-2 focus-within:ring-accent";
  const primaryBtn =
    "inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-colors duration-150 hover:bg-accent-500 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="bg-surface min-h-screen">
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
        <section className="mb-6">
          <h1 className="text-ink text-2xl font-semibold sm:text-3xl">
            Configurações da Conta
          </h1>
          <p className="text-ink/70 mt-1">
            Gerencie seus dados pessoais e segurança.
          </p>
        </section>

        {/* Header tile */}
        <section className="rounded-bento-lg bg-surface-soft mb-6 p-5 sm:p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="bg-accent/15 text-accent-ink flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full text-3xl font-semibold">
              {user?.urlPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.urlPhoto}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(displayName)
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-ink text-2xl font-semibold">{displayName}</h2>
                <span className="bg-ink/8 text-ink/80 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                  {displayRole}
                </span>
              </div>
              <p className="text-ink/80 mt-1 font-medium break-all">{displayEmail}</p>
              <p className="text-ink/70 mt-1 text-sm">
                Membro desde {memberSince}
              </p>
            </div>
          </div>
        </section>

        {/* Forms */}
        <section className="grid grid-cols-1 gap-6">
          <article className="rounded-bento-lg bg-surface-soft p-5 sm:p-6">
            <h3 className="text-ink text-xl font-semibold">
              Informações Pessoais
            </h3>
            <div className="mt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-ink/80 text-sm font-medium">
                  Nome Completo
                  <div className={fieldWrap}>
                    <MdOutlinePerson className="text-ink/50" size={18} aria-hidden="true" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="placeholder:text-ink/60 w-full bg-transparent text-sm font-normal outline-none"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </label>

                <label className="text-ink/80 text-sm font-medium">
                  E-mail
                  <div className="rounded-bento-md border-ink/10 bg-ink/5 text-ink/70 mt-2 flex items-center gap-2 border px-3.5 py-3">
                    <MdEmail className="text-ink/50" size={18} aria-hidden="true" />
                    <input
                      value={displayEmail}
                      readOnly
                      disabled
                      className="w-full cursor-not-allowed bg-transparent text-sm font-normal outline-none"
                      title="O e-mail não pode ser alterado"
                    />
                  </div>
                  <span className="text-ink/70 mt-1 block text-xs font-normal">
                    Alteração de e-mail não disponível no momento.
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleSaveName}
                disabled={namePending || name.trim() === user?.name}
                className={primaryBtn}
              >
                <MdCheckCircleOutline size={16} aria-hidden="true" />
                {namePending ? "Salvando..." : "Salvar Nome"}
              </button>
            </div>
          </article>

          <article className="rounded-bento-lg bg-surface-soft p-5 sm:p-6">
            <h3 className="text-ink text-xl font-semibold">Segurança</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-ink/80 text-sm font-medium">
                Nova Senha
                <div className={fieldWrap}>
                  <MdLock className="text-ink/50" size={18} aria-hidden="true" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="placeholder:text-ink/60 w-full bg-transparent text-sm font-normal outline-none"
                  />
                </div>
              </label>

              <label className="text-ink/80 text-sm font-medium">
                Confirmar Senha
                <div className={fieldWrap}>
                  <MdSecurity className="text-ink/50" size={18} aria-hidden="true" />
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="placeholder:text-ink/60 w-full bg-transparent text-sm font-normal outline-none"
                  />
                </div>
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleSavePassword}
                disabled={passwordPending}
                className={primaryBtn}
              >
                <MdLock size={16} aria-hidden="true" />
                {passwordPending ? "Salvando..." : "Alterar Senha"}
              </button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
