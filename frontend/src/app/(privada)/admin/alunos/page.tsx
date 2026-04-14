"use client";

import { useState } from "react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import {
  MdCheckCircle,
  MdDeleteOutline,
  MdDoNotDisturbOn,
  MdOutlineBlock,
  MdOutlinePeopleAlt,
  MdSearch,
} from "react-icons/md";

type StudentItem = {
  id: string;
  name: string;
  email: string;
  plan: "Premium" | "Free";
  startDate: string;
  status: "Ativo" | "Inativo";
  avatarClass: string;
};

type StudentActionTarget = {
  type: "inactivate" | "delete";
  studentName: string;
};

const students: StudentItem[] = [
  {
    id: "1",
    name: "Carlos Eduardo",
    email: "carlos.edu@email.com",
    plan: "Premium",
    startDate: "12 Out, 2023",
    status: "Ativo",
    avatarClass: "bg-gradient-to-br from-amber-300 to-orange-500",
  },
  {
    id: "2",
    name: "Mariana Silva",
    email: "mariana.s@email.com",
    plan: "Free",
    startDate: "05 Nov, 2023",
    status: "Ativo",
    avatarClass: "bg-gradient-to-br from-cyan-300 to-blue-500",
  },
  {
    id: "3",
    name: "Ricardo Mendes",
    email: "ricardo.guitar@email.com",
    plan: "Premium",
    startDate: "20 Set, 2023",
    status: "Inativo",
    avatarClass: "bg-gradient-to-br from-slate-300 to-slate-500",
  },
  {
    id: "4",
    name: "Ana Luiza",
    email: "ana.lu@email.com",
    plan: "Premium",
    startDate: "01 Dez, 2023",
    status: "Ativo",
    avatarClass: "bg-gradient-to-br from-pink-300 to-rose-500",
  },
];

export default function StudentsPage() {
  const [actionTarget, setActionTarget] = useState<StudentActionTarget | null>(
    null,
  );

  const isInactivateAction = actionTarget?.type === "inactivate";

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <section className="mb-7">
          <h1 className="text-secondary text-2xl font-bold">
            Gestao de Alunos
          </h1>
          <p className="mt-1 text-gray-500">
            Gerencie e acompanhe todos os alunos matriculados na plataforma.
          </p>
        </section>

        <section className="mb-7 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <MdOutlinePeopleAlt size={22} />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500">
              Total de Alunos
            </p>
            <p className="text-secondary mt-1 text-2xl font-bold">1,250</p>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <MdCheckCircle size={22} />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500">Alunos Ativos</p>
            <p className="text-secondary mt-1 text-2xl font-bold">1,180</p>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-red-100 p-2 text-red-500">
                <MdDoNotDisturbOn size={22} />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500">Inativos</p>
            <p className="text-secondary mt-1 text-2xl font-bold">70</p>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <header className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
            <label className="relative flex-1">
              <MdSearch
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-orange-500"
              />
              <input
                type="text"
                placeholder="Buscar por nome, email ou plano..."
                className="w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm text-gray-700 outline-none focus:border-orange-300"
              />
            </label>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="bg-gray-100 text-xs font-semibold tracking-[0.12em] text-gray-500 uppercase">
                  <th className="px-6 py-4">Aluno</th>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Data de Inicio</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Acoes</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full ${student.avatarClass}`}
                        />
                        <span className="font-semibold text-gray-800">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          student.plan === "Premium"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {student.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {student.startDate}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-semibold ${
                          student.status === "Ativo"
                            ? "text-green-600"
                            : "text-slate-400"
                        }`}
                      >
                        <span className="text-xs">●</span>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3 text-gray-400">
                        <button
                          type="button"
                          onClick={() =>
                            setActionTarget({
                              type: "inactivate",
                              studentName: student.name,
                            })
                          }
                          className="rounded-md p-1 hover:bg-amber-50 hover:text-amber-600"
                          aria-label={`Deixar aluno ${student.name} inativo`}
                        >
                          <MdOutlineBlock size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActionTarget({
                              type: "delete",
                              studentName: student.name,
                            })
                          }
                          className="rounded-md p-1 hover:bg-red-50 hover:text-red-500"
                          aria-label={`Deletar aluno ${student.name}`}
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

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 p-4 text-sm text-gray-500">
            <span>Exibindo 4 de 1,250 alunos</span>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-500 hover:bg-gray-50">
                &lt;
              </button>
              <button className="rounded-lg bg-orange-500 px-3 py-1.5 font-semibold text-white">
                1
              </button>
              <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-600 hover:bg-gray-50">
                2
              </button>
              <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-600 hover:bg-gray-50">
                3
              </button>
              <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-500 hover:bg-gray-50">
                &gt;
              </button>
            </div>
          </footer>
        </section>
      </main>

      <DeleteConfirmModal
        open={Boolean(actionTarget)}
        label={actionTarget?.studentName ?? ""}
        title={isInactivateAction ? "Inativar aluno" : "Deletar aluno"}
        description={
          isInactivateAction
            ? "Deseja mesmo deixar este aluno inativo?"
            : "Deseja mesmo deletar este aluno?"
        }
        confirmLabel={isInactivateAction ? "Sim, inativar" : "Sim, deletar"}
        onCancel={() => setActionTarget(null)}
        onConfirm={() => setActionTarget(null)}
      />
    </div>
  );
}
