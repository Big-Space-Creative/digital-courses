"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { deleteAccountAction, logoutAction } from "@/app/actions/auth";
import {
  changePasswordAction,
  updateProfileNameAction,
} from "@/app/actions/users";
import { toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  MdLockOutline,
  MdOutlineExitToApp,
  MdOutlinePersonOutline,
  MdOutlineSave,
  MdOutlineWarningAmber,
  MdOutlineEmail,
} from "react-icons/md";

function getInitials(name?: string | null): string {
  if (!name) return "AL";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Perfil() {
  const router = useRouter();
  const { user, setUser } = useUser();

  const [name, setName] = useState(user?.name ?? "");
  const [prevUserName, setPrevUserName] = useState(user?.name);
  if (user?.name !== prevUserName) {
    setPrevUserName(user?.name);
    setName(user?.name ?? "");
  }

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  // Delete account modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);

  const profile = {
    name: user?.name ?? "Aluno",
    email: user?.email ?? "",
    subscriptionType: user?.subscriptionType ?? "free",
    urlPhoto: user?.urlPhoto,
  };

  // Q19: Só usar fallback de iniciais quando não houver URL válida
  const showPhoto = Boolean(profile.urlPhoto && profile.urlPhoto.trim() !== "");
  const initials = getInitials(profile.name);

  const handleLogout = async () => {
    const res = await logoutAction();
    toast(res.message, {
      description: "Volte logo! Seus cursos estarão te esperando.",
      variant: "success",
    });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(undefined);

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast("O nome não pode ficar em branco.", { variant: "error" });
      return;
    }

    // Q03: Mínimo 8 caracteres e validação ANTES de qualquer mutação
    const hasPasswordAttempt = Boolean(newPassword || confirmPassword);
    if (hasPasswordAttempt) {
      if (newPassword.length < 8) {
        setPasswordError("A nova senha deve ter no mínimo 8 caracteres.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("A confirmação de senha não confere.");
        return;
      }
    }

    startTransition(async () => {
      let nameUpdated = false;
      let passwordUpdated = false;

      // 1. Atualiza nome se alterado
      if (trimmedName !== user?.name) {
        const nameRes = await updateProfileNameAction(trimmedName);
        if (!nameRes.success) {
          toast(nameRes.error ?? "Falha ao atualizar o nome.", {
            variant: "error",
          });
          return;
        }
        if (user) {
          setUser({ ...user, name: trimmedName });
        }
        nameUpdated = true;
      }

      // 2. Atualiza senha se preenchida
      if (hasPasswordAttempt) {
        const passRes = await changePasswordAction({
          password: newPassword,
          password_confirmation: confirmPassword,
        });

        if (!passRes.success) {
          // Q03: Informar falha parcial sem sugerir atomicidade inexistente
          if (nameUpdated) {
            toast(
              `Nome atualizado com sucesso, mas ocorreu um erro ao alterar a senha: ${passRes.error ?? "Falha na senha"}`,
              { variant: "error" },
            );
          } else {
            toast(passRes.error ?? "Falha ao alterar a senha.", {
              variant: "error",
            });
          }
          return;
        }

        setNewPassword("");
        setConfirmPassword("");
        passwordUpdated = true;
      }

      if (nameUpdated && passwordUpdated) {
        toast("Alterações salvas com sucesso!", { variant: "success" });
      } else if (nameUpdated) {
        toast("Nome atualizado com sucesso!", { variant: "success" });
      } else if (passwordUpdated) {
        toast("Senha alterada com sucesso!", { variant: "success" });
      } else {
        toast("Nenhuma alteração detectada.");
      }
    });
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast("Digite sua senha atual para confirmar a exclusão.", {
        variant: "error",
      });
      return;
    }

    setIsDeleting(true);
    const res = await deleteAccountAction(deletePassword);
    setIsDeleting(false);

    if (!res.success) {
      toast(res.error ?? "Não foi possível excluir sua conta.", {
        variant: "error",
      });
      return;
    }

    toast(res.message ?? "Conta excluída com sucesso.", {
      description: "Seus dados foram removidos.",
      variant: "success",
    });

    setUser(null);
    setIsDeleteOpen(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      {/* Page Header */}
      <PageHeader
        title="Configurações da Conta"
        description="Gerencie seus dados de acesso, preferências e segurança da conta."
      />

      {/* Profile Card Header (Q08/Q09: Sem datas fictícias nem rótulos arbitrários) */}
      <section
        aria-label="Resumo do perfil"
        className="border-border bg-panel rounded-[var(--radius-panel)] border p-6 shadow-[var(--shadow-panel)] transition-colors"
      >
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
          {/* Avatar Container */}
          <div className="border-border relative size-24 shrink-0 overflow-hidden rounded-full border-2 shadow-xs">
            {showPhoto && profile.urlPhoto ? (
              <Image
                src={profile.urlPhoto}
                alt={`Foto de ${profile.name}`}
                fill
                sizes="96px"
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="bg-accent/15 text-accent-text flex size-full items-center justify-center text-2xl font-bold">
                {initials}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-text truncate text-xl font-bold sm:text-2xl">
                {profile.name}
              </h2>
              <Badge
                variant={
                  profile.subscriptionType.toLowerCase() === "premium"
                    ? "accent"
                    : "neutral"
                }
                className="text-xs font-semibold uppercase"
              >
                Plano {profile.subscriptionType}
              </Badge>
            </div>

            {profile.email && (
              <p className="text-text-muted text-sm">{profile.email}</p>
            )}

            <p className="text-text-muted mt-1 text-xs">
              Conta de aluno na plataforma Pullse.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form & Account Actions Grid */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_300px]">
        {/* Form Container */}
        <form
          onSubmit={handleSaveProfile}
          className="border-border bg-panel flex flex-col gap-6 rounded-[var(--radius-panel)] border p-6 shadow-[var(--shadow-panel)]"
        >
          {/* Informações Pessoais */}
          <fieldset className="border-border flex flex-col gap-4 border-b pb-6">
            <legend className="text-text mb-2 text-base font-bold">
              Informações Pessoais
            </legend>

            <Input
              id="profile-name"
              label="Nome Completo"
              icon={MdOutlinePersonOutline}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              help="Nome de exibição da sua conta."
            />

            <Input
              id="profile-email"
              label="E-mail"
              icon={MdOutlineEmail}
              type="email"
              value={profile.email}
              disabled
              help="Para alterar o e-mail cadastrado, entre em contato com o suporte."
              className="cursor-not-allowed opacity-75"
            />
          </fieldset>

          {/* Segurança */}
          <fieldset className="border-border flex flex-col gap-4 border-b pb-6">
            <legend className="text-text mb-1 text-base font-bold">
              Alterar Senha
            </legend>
            <p className="text-text-muted mb-2 text-xs">
              Deixe os campos em branco se não deseja alterar sua senha atual.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="profile-new-password"
                label="Nova Senha"
                icon={MdLockOutline}
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={passwordError}
                help="No mínimo 8 caracteres."
              />

              <Input
                id="profile-confirm-password"
                label="Confirmar Nova Senha"
                icon={MdLockOutline}
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </fieldset>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isPending}
              className="cursor-pointer gap-2 font-semibold shadow-xs"
            >
              <MdOutlineSave className="size-5" />
              <span>Salvar Alterações</span>
            </Button>
          </div>
        </form>

        {/* Actions Sidebar */}
        <aside
          aria-label="Ações de conta"
          className="border-border bg-panel flex flex-col gap-4 rounded-[var(--radius-panel)] border p-6 shadow-[var(--shadow-panel)]"
        >
          <div>
            <h3 className="text-text text-sm font-bold">Ações da Conta</h3>
            <p className="text-text-muted mt-1 text-xs">
              Controle de sessão e encerramento de conta.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleLogout}
            className="w-full cursor-pointer justify-center gap-2 text-xs"
          >
            <MdOutlineExitToApp className="size-4" />
            <span>Sair da Conta</span>
          </Button>

          <div className="border-border border-t pt-4">
            <Button
              type="button"
              variant="danger"
              onClick={() => setIsDeleteOpen(true)}
              className="w-full cursor-pointer text-xs"
            >
              Excluir minha conta
            </Button>
          </div>
        </aside>
      </div>

      {/* Delete Account Modal (Q07: dismissible={!isDeleting} e Cancelar bloqueado; Q09: contrato real) */}
      <Dialog
        open={isDeleteOpen}
        dismissible={!isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteOpen(false);
            setDeletePassword("");
          }
        }}
        title="Excluir minha conta"
        description="Esta ação é permanente. Seus dados serão anonimizados ou eliminados conforme a Política de Privacidade."
        initialFocusRef={cancelDeleteRef}
      >
        <div className="mt-2 flex flex-col gap-4">
          <div className="bg-danger/10 border-danger/20 text-danger flex items-start gap-3 rounded-[var(--radius-control)] border p-3 text-xs">
            <MdOutlineWarningAmber className="mt-0.5 size-5 shrink-0" />
            <p>
              A exclusão da conta encerrará seu acesso à plataforma de forma
              definitiva.
            </p>
          </div>

          <Input
            id="delete-password-input"
            label="Digite sua senha atual para confirmar:"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Sua senha de acesso"
            required
            autoComplete="current-password"
          />

          <div className="mt-2 flex justify-end gap-3">
            <Button
              ref={cancelDeleteRef}
              type="button"
              variant="secondary"
              onClick={() => {
                if (!isDeleting) {
                  setIsDeleteOpen(false);
                  setDeletePassword("");
                }
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              variant="danger"
              loading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Confirmar Exclusão
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
