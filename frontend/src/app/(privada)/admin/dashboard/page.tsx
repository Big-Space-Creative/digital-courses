"use client";

import { useState } from "react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import Link from "next/link";
import {
  MdPeople,
  MdPlayCircle,
  MdSearch,
  MdEdit,
  MdDeleteOutline,
  MdAddCircleOutline,
} from "react-icons/md";

type CourseItem = {
  id: string;
  name: string;
  launchDate: string;
  thumbClass: string;
};

const courses: CourseItem[] = [
  {
    id: "1",
    name: "Guitarra Iniciante",
    launchDate: "12/05/2023",
    thumbClass: "bg-orange-100",
  },
  {
    id: "2",
    name: "Tecnicas de Solo",
    launchDate: "20/08/2023",
    thumbClass: "bg-yellow-100",
  },
  {
    id: "3",
    name: "Teoria Musical",
    launchDate: "05/01/2024",
    thumbClass: "bg-gray-200",
  },
];

export default function Dashboard() {
  const [selectedCourseName, setSelectedCourseName] = useState<string | null>(
    null,
  );

  return (
    <div className="bg-background flex min-h-screen flex-col font-sans">
      <main className="mx-auto w-full max-w-7xl flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-secondary text-2xl font-bold">
              Bem-vindo ao seu painel, Ramon!
            </h2>
            <p className="mt-1 text-gray-500">
              Aqui está o que está acontecendo com seus cursos hoje.
            </p>
          </div>
          <Link
            href="/admin/cursos/criar"
            className="bg-primary hover:bg-primary-dark flex cursor-pointer items-center gap-2 rounded-md px-4 py-2.5 font-medium text-white shadow-sm transition-colors"
          >
            <MdAddCircleOutline size={20} />
            Adicionar Novo Curso
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="text-primary rounded-lg bg-orange-50 p-2">
                <MdPeople size={20} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Total de Alunos</p>
            <p className="text-secondary mt-1 text-2xl font-bold">1.240</p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-500">
                <MdPlayCircle size={20} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Aulas Ativas</p>
            <p className="text-secondary mt-1 text-2xl font-bold">45</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Header da Tabela */}
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <h3 className="font-bold text-gray-800">Cursos Cadastrados</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <MdSearch
                  size={16}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Buscar curso..."
                  className="focus:border-primary focus:ring-primary/20 w-64 rounded-md border border-gray-200 py-2 pr-4 pl-9 text-sm focus:ring-2 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Conteúdo da Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  <th className="px-6 py-4">Nome do Curso</th>
                  <th className="px-6 py-4">Data de Lançamento</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-md ${course.thumbClass}`}
                        />
                        <span className="font-semibold text-gray-800">
                          {course.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {course.launchDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3 text-gray-400">
                        <Link
                          href={`/admin/cursos/editar/${course.id}`}
                          className="hover:text-blue-500"
                          aria-label={`Editar curso ${course.name}`}
                        >
                          <MdEdit size={18} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedCourseName(course.name)}
                          className="hover:text-red-500"
                          aria-label={`Cancelar curso ${course.name}`}
                        >
                          <MdDeleteOutline size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 p-4 text-sm">
            <span className="text-gray-500">Mostrando 3 de 12 cursos</span>
            <div className="flex gap-2">
              <button className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                Anterior
              </button>
              <button className="rounded-md border border-gray-200 px-3 py-1.5 text-gray-600 hover:bg-gray-50">
                Próximo
              </button>
            </div>
          </div>
        </div>
      </main>

      <DeleteConfirmModal
        open={Boolean(selectedCourseName)}
        label={selectedCourseName ?? ""}
        title="Cancelar curso"
        description="Deseja mesmo cancelar este curso?"
        confirmLabel="Sim, cancelar"
        onCancel={() => setSelectedCourseName(null)}
        onConfirm={() => setSelectedCourseName(null)}
      />
    </div>
  );
}
