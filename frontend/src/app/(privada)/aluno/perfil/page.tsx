import { Input } from "@/components/form/Input";
import Image from "next/image";
import Link from "next/link";
import {
  MdLockOutline,
  MdOutlineEmail,
  MdOutlineExitToApp,
  MdOutlinePersonOutline,
  MdOutlineSave,
  MdOutlineStarBorder,
} from "react-icons/md";

export default function Profile() {
  const user = {
    name: "João Silva",
    email: "jãozin@gmail.com",
    plan: "Premium",
    urlPhoto:
      "https://images.unsplash.com/photo-1654110455429-cf322b40a906?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  };

  return (
    <div className="flex w-full max-w-4xl flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-secondary text-3xl font-bold">
          Configurações da Conta
        </h1>
        <p className="text-secondary/60 text-base">
          Gerencie seus dados pessoais, detalhes da assinatura e preferências.
        </p>
      </div>
      <div className="bg-secondary flex items-center gap-4 rounded-2xl p-6">
        <div className="group border-primary relative size-32 cursor-pointer overflow-hidden rounded-full border-4">
          <Image
            src={user.urlPhoto}
            alt="foto"
            fill
            className="object-cover hover:hidden"
            quality={60}
          />
          <div className="bg-primary/80 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="text-sm font-semibold text-white">
              Editar foto
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <div className="bg-primary/20 text-primary border-primary/50 flex items-center gap-1 rounded-full border px-3 py-1 font-bold">
              <MdOutlineStarBorder className="size-4" />
              <p className="text-xs uppercase">{user.plan}</p>
            </div>
          </div>
          <p className="text-primary">{user.email}</p>
          <p className="text-white/50">Membro desde Março de 2023</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="border-secondary/10 flex gap-4 border-b-2">
          <p className="text-primary border-primary w-fit border-b-4 pb-4 font-bold tracking-wider">
            Perfil
          </p>
        </div>
        <div className="flex justify-between gap-10">
          <form className="flex flex-1 flex-col gap-8 rounded-2xl bg-white p-6">
            <div className="flex flex-col gap-4">
              <h1 className="text-secondary font-bold">Informações Pessoais</h1>
              <div className="flex gap-4">
                <Input
                  label="Nome Completo"
                  icon={MdOutlinePersonOutline}
                  type="text"
                  placeholder={user.name}
                />
                <Input
                  label="Email"
                  icon={MdOutlineEmail}
                  type="email"
                  placeholder={user.name}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-secondary font-bold">Segurança</h1>
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
            <button className="bg-primary hover:bg-primary-dark flex w-fit cursor-pointer items-center gap-2 rounded-lg px-8 py-3 text-white">
              <MdOutlineSave /> Salvar Alterações
            </button>
          </form>
          <div className="flex flex-col gap-4 rounded-2xl bg-white p-6">
            <h1 className="text-secondary font-bold">Ações da Conta</h1>
            <button className="border-secondary/20 text-secondary/80 flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-10 py-2 hover:border-red-500 hover:text-red-500">
              <MdOutlineExitToApp className="size-5" /> Sair da Conta
            </button>
            <button className="cursor-pointer rounded-lg bg-red-100 px-10 py-2 text-sm text-red-500 hover:bg-red-200">
              Excluir minha conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
