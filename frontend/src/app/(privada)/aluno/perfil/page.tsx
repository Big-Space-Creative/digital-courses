"use client";

import { useState } from "react";

import { deleteAccountAction, logoutAction } from "@/app/actions/auth";
import { Input } from "@/components/form/Input";
import { toast } from "@/components/ui/Toast";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MdLockOutline,
  MdOutlineEmail,
  MdOutlineExitToApp,
  MdOutlinePersonOutline,
  MdOutlineSave,
  MdOutlineStarBorder,
} from "react-icons/md";

export default function Profile() {
  const router = useRouter();
  const { user, setUser } = useUser();

  const profile = {
    name: user?.name ?? "Aluno",
    email: user?.email ?? "",
    subscriptionType: user?.subscriptionType ?? "Free",
    urlPhoto:
      user?.urlPhoto ||
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  };

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

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast("Informe sua senha para confirmar.", { variant: "error" });
      return;
    }

    setIsDeleting(true);
    const res = await deleteAccountAction(deletePassword);
    setIsDeleting(false);

    if (!res.success) {
      toast(res.error ?? "Falha ao excluir a conta.", { variant: "error" });
      return;
    }

    toast(res.message ?? "Conta excluída com sucesso.", {
      description: "Sentiremos sua falta.",
      variant: "success",
    });

    setUser(null);
    setIsDeleteOpen(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex w-full max-w-4xl flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-ink text-3xl font-bold">
          Configurações da Conta
        </h1>
        <p className="text-ink/60 text-base">
          Gerencie seus dados pessoais, detalhes da assinatura e preferências.
        </p>
      </div>
      <div className="bg-ink rounded-bento-lg flex items-center gap-4 p-6">
        <div className="group border-accent relative size-32 cursor-pointer overflow-hidden rounded-full border-4">
          <Image
            src={profile.urlPhoto}
            alt="foto"
            fill
            className="object-cover hover:hidden"
            quality={60}
          />
          <div className="bg-accent/80 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="text-sm font-semibold text-white">
              Editar foto
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-surface text-2xl font-bold">
              {profile.name}
            </h1>
            <div className="bg-accent/20 text-accent-400 border-accent/50 flex items-center gap-1 rounded-full border px-3 py-1 font-bold">
              <MdOutlineStarBorder className="size-4" />
              <p className="text-xs uppercase">{profile.subscriptionType}</p>
            </div>
          </div>
          <p className="text-accent-400">{profile.email}</p>
          <p className="text-surface/50">Membro desde Março de 2023</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="border-ink/10 flex gap-4 border-b-2">
          <p className="text-accent border-accent w-fit border-b-4 pb-4 font-bold tracking-wider">
            Perfil
          </p>
        </div>
        <div className="flex justify-between gap-10">
          <form className="border-ink/10 bg-surface-soft rounded-bento-md flex flex-1 flex-col gap-8 border p-6">
            <div className="flex flex-col gap-4">
              <h1 className="text-ink font-bold">Informações Pessoais</h1>
              <div className="flex gap-4">
                <Input
                  label="Nome Completo"
                  icon={MdOutlinePersonOutline}
                  type="text"
                  placeholder={profile.name}
                />
                <Input
                  label="Email"
                  icon={MdOutlineEmail}
                  type="email"
                  placeholder={profile.email}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-ink font-bold">Segurança</h1>
              <div className="flex gap-4">
                <Input
                  label="Nova Senha"
                  icon={MdLockOutline}
                  type="password"
                  placeholder="********"
                />
                <Input
                  label="Confirmar Senha"
                  icon={MdLockOutline}
                  type="password"
                  placeholder="********"
                />
              </div>
            </div>
            <button
              className="gradient-animate flex w-fit cursor-pointer items-center gap-2 rounded-full px-8 py-3 text-white transition-transform duration-150 ease-out hover:-translate-y-0.5"
              style={{ backgroundImage: "var(--gradient-pulse)" }}
            >
              <MdOutlineSave /> Salvar Alterações
            </button>
          </form>
          <div className="border-ink/10 bg-surface-soft rounded-bento-md flex flex-col gap-4 border p-6">
            <h1 className="text-ink font-bold">Ações da Conta</h1>
            <button
              onClick={() => handleLogout()}
              className="border-ink/15 text-ink/70 flex cursor-pointer items-center justify-center gap-2 rounded-full border px-10 py-2 hover:border-red-500 hover:text-red-500"
            >
              <MdOutlineExitToApp className="size-5" /> Sair da Conta
            </button>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="cursor-pointer rounded-full bg-red-100 px-10 py-2 text-sm text-red-500 hover:bg-red-200"
            >
              Excluir minha conta
            </button>
          </div>
        </div>
      </div>

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-soft rounded-bento-md flex w-full max-w-md flex-col gap-4 p-6">
            <h2 className="text-ink text-xl font-bold">
              Excluir minha conta
            </h2>
            <p className="text-ink/70 text-sm">
              Esta ação é permanente. Seus dados serão anonimizados ou
              eliminados conforme a Política de Privacidade. Digite sua senha
              para confirmar.
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Sua senha atual"
              className="border-ink/15 focus:border-accent rounded-bento-sm border px-4 py-2 outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeletePassword("");
                }}
                disabled={isDeleting}
                className="border-ink/15 text-ink/70 hover:bg-ink/5 cursor-pointer rounded-full border px-6 py-2 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteAccount()}
                disabled={isDeleting}
                className="cursor-pointer rounded-full bg-red-500 px-6 py-2 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? "Excluindo..." : "Excluir conta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
