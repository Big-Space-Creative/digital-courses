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
    ? new Date(user.createdAt ?? Date.now()).toLocaleDateString("pt-BR", {
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

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <section className="mb-6">
          <h1 className="text-secondary text-2xl font-bold sm:text-3xl">
            Configurações da Conta
          </h1>
          <p className="mt-1 text-gray-500">
            Gerencie seus dados pessoais e segurança.
          </p>
        </section>

        {/* Header card */}
        <section className="bg-secondary mb-8 rounded-2xl p-5 text-white shadow-sm sm:p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-orange-400 bg-gradient-to-br from-orange-400 to-amber-600 text-3xl font-bold text-white">
              {user?.urlPhoto ? (
                <img
                  src={user.urlPhoto}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(displayName)
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">{displayName}</h2>
                <span className="bg-primary/20 text-primary border-primary/50 rounded-full border px-2 py-0.5 text-xs font-bold uppercase">
                  {displayRole}
                </span>
              </div>
              <p className="text-primary mt-1 font-medium">{displayEmail}</p>
              <p className="mt-1 text-sm text-gray-300">
                Membro desde {memberSince}
              </p>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            {/* Informações pessoais */}
            <h3 className="text-secondary text-xl font-semibold">
              Informações Pessoais
            </h3>
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-gray-600">
                  Nome Completo
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700">
                    <MdOutlinePerson className="text-gray-400" size={18} />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </label>

                <label className="text-sm font-semibold text-gray-600">
                  E-mail
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-100 px-3 py-2.5 text-gray-400">
                    <MdEmail className="text-gray-300" size={18} />
                    <input
                      value={displayEmail}
                      readOnly
                      disabled
                      className="w-full cursor-not-allowed bg-transparent text-sm outline-none"
                      title="O e-mail não pode ser alterado"
                    />
                  </div>
                  <span className="mt-1 block text-xs font-normal text-gray-400">
                    ⚠ Alteração de e-mail não disponível no momento.
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleSaveName}
                disabled={namePending || name.trim() === user?.name}
                className="bg-primary hover:bg-primary-dark inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
              >
                <MdCheckCircleOutline size={16} />
                {namePending ? "Salvando..." : "Salvar Nome"}
              </button>
            </div>

            {/* Segurança */}
            <h3 className="text-secondary mt-8 text-xl font-semibold">
              Segurança
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-gray-600">
                Nova Senha
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700">
                  <MdLock className="text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>

              <label className="text-sm font-semibold text-gray-600">
                Confirmar Senha
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700">
                  <MdSecurity className="text-gray-400" size={18} />
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleSavePassword}
                disabled={passwordPending}
                className="bg-primary hover:bg-primary-dark inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
              >
                <MdLock size={16} />
                {passwordPending ? "Salvando..." : "Alterar Senha"}
              </button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
