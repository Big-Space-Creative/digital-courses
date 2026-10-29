"use client";
import Image from "next/image";

import { useState, useTransition } from "react";
import { useUser } from "@/context/UserContext";
import { toast } from "@/components/ui/Toast";
import {
  changePasswordAction,
  updateProfileNameAction,
} from "@/app/actions/users";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";

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
  const memberSince =
    user?.createdAt && !Number.isNaN(new Date(user.createdAt).getTime())
      ? new Date(user.createdAt).toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        })
      : "—";

  // ── Nome ─────────────────────────────────────────────────────────────────────
  const [nameValue, setName] = useState<string | null>(null);
  const name = nameValue ?? displayName;
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [namePending, startNameTransition] = useTransition();

  function handleSaveName() {
    if (!name.trim()) {
      setNameError("Informe seu nome completo.");
      return;
    }
    setNameError("");
    if (name.trim() === user?.name) return;
    startNameTransition(async () => {
      const res = await updateProfileNameAction(name.trim());
      if (!res.success) {
        setNameError(res.error ?? "Não foi possível atualizar o nome.");
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
    setPasswordError("");
    if (!password || !passwordConfirm) {
      setPasswordError("Preencha a nova senha e a confirmação.");
      toast("Campos obrigatórios", {
        description: "Preencha a nova senha e a confirmação.",
        variant: "error",
      });
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordError("A nova senha e a confirmação precisam ser iguais.");
      toast("Senhas não conferem", {
        description: "A nova senha e a confirmação precisam ser iguais.",
        variant: "error",
      });
      return;
    }
    if (password.length < 8) {
      setPasswordError("A senha precisa ter no mínimo 8 caracteres.");
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
        setPasswordError(res.error ?? "Não foi possível atualizar a senha.");
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
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Minha conta"
        description="Atualize seus dados pessoais e mantenha sua conta segura."
      />
      <section className="border-border flex flex-wrap items-center gap-4 border-b pb-6">
        <span className="bg-panel flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-xl font-semibold">
          {user?.urlPhoto ? (
            <Image
              unoptimized
              width={320}
              height={180}
              src={user.urlPhoto}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            initials(displayName)
          )}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold break-words">{displayName}</h2>
            <Badge>{displayRole}</Badge>
          </div>
          <p className="text-text-muted mt-1 text-sm break-all">
            {displayEmail}
          </p>
          {user?.createdAt &&
            !Number.isNaN(new Date(user.createdAt).getTime()) && (
              <p className="text-text-muted mt-1 text-xs">
                Membro desde {memberSince}
              </p>
            )}
        </div>
      </section>
      <section className="grid gap-6">
        <form
          className="border-border bg-panel space-y-5 rounded-2xl border p-4 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            handleSaveName();
          }}
          noValidate
        >
          <h2 className="text-lg font-semibold">Informações pessoais</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome completo"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={nameError || undefined}
              disabled={namePending}
            />
            <Input
              label="E-mail"
              type="email"
              value={displayEmail}
              readOnly
              help="A alteração de e-mail não está disponível no momento."
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={namePending}
              disabled={!user || name.trim() === user.name}
            >
              Salvar nome
            </Button>
          </div>
        </form>
        <form
          className="border-border bg-panel space-y-5 rounded-2xl border p-4 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            handleSavePassword();
          }}
          noValidate
        >
          <h2 className="text-lg font-semibold">Segurança</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              help="Use pelo menos 8 caracteres."
              error={passwordError || undefined}
              disabled={passwordPending}
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              disabled={passwordPending}
              aria-invalid={!!passwordError}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={passwordPending}>
              Alterar senha
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
