"use client";

import { useState } from "react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { MdEmail, MdLock, MdOutlinePerson, MdSecurity } from "react-icons/md";

export default function AdminProfilePage() {
  const [actionTarget, setActionTarget] = useState<"logout" | "delete" | null>(
    null,
  );

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <section className="mb-6">
          <h1 className="text-secondary text-2xl font-bold sm:text-3xl">
            Configuracoes da Conta
          </h1>
          <p className="mt-1 text-gray-500">
            Gerencie seus dados pessoais, detalhes da assinatura e preferencias.
          </p>
        </section>

        <section className="bg-secondary mb-8 rounded-2xl p-5 text-white shadow-sm sm:p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="group text-secondary border-primary relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 bg-teal-100 text-3xl font-bold">
              CS
              <div className="bg-primary/80 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="text-xs font-semibold text-white">
                  Editar foto
                </span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">Carlos Silva</h2>
                <span className="bg-primary/20 text-primary border-primary/50 rounded-full border px-2 py-0.5 text-xs font-bold">
                  ADM
                </span>
              </div>
              <p className="text-primary mt-1 font-medium">
                carlos.silva@exemplo.com
              </p>
              <p className="mt-1 text-sm text-gray-300">
                Membro desde Marco de 2023
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6 border-b border-gray-200">
          <button className="border-primary text-primary border-b-2 px-1 pb-3 text-sm font-semibold">
            Perfil
          </button>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-secondary text-xl font-semibold">
              Informacoes Pessoais
            </h3>
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-gray-600">
                  Nome Completo
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700">
                    <MdOutlinePerson className="text-gray-400" size={18} />
                    <input
                      defaultValue="Carlos Silva"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>

                <label className="text-sm font-semibold text-gray-600">
                  Email
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700">
                    <MdEmail className="text-gray-400" size={18} />
                    <input
                      defaultValue="carlos@example.com"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>
              </div>
            </div>

            <h3 className="text-secondary mt-8 text-xl font-semibold">
              Seguranca
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-gray-600">
                Nova Senha
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700">
                  <MdLock className="text-gray-400" size={18} />
                  <input
                    type="password"
                    defaultValue="********"
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
                    defaultValue="********"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>
            </div>

            <div className="mt-7 flex justify-start sm:justify-end">
              <button className="bg-primary hover:bg-primary-dark inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition">
                <MdLock size={16} />
                Salvar Alteracoes
              </button>
            </div>
          </article>
        </section>
      </main>

      <DeleteConfirmModal
        open={actionTarget === "logout"}
        label="da conta atual"
        title="Sair da conta"
        description="Deseja mesmo sair da sua conta?"
        confirmLabel="Sim, sair"
        onCancel={() => setActionTarget(null)}
        onConfirm={() => setActionTarget(null)}
      />

      <DeleteConfirmModal
        open={actionTarget === "delete"}
        label="sua conta"
        title="Excluir conta"
        description="Deseja mesmo excluir sua conta?"
        confirmLabel="Sim, excluir"
        onCancel={() => setActionTarget(null)}
        onConfirm={() => setActionTarget(null)}
      />
    </div>
  );
}
