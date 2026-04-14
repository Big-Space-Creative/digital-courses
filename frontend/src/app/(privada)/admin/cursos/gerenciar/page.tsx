"use client";

import { useState } from "react";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import Link from "next/link";
import {
  MdAddCircleOutline,
  MdEdit,
  MdOutlineDelete,
  MdSearch,
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
    thumbClass: "bg-gradient-to-br from-orange-300 to-amber-600",
  },
  {
    id: "2",
    name: "Tecnicas de Solo",
    launchDate: "20/08/2023",
    thumbClass: "bg-gradient-to-br from-slate-300 to-slate-500",
  },
  {
    id: "3",
    name: "Teoria Musical",
    launchDate: "03/10/2023",
    thumbClass: "bg-gradient-to-br from-zinc-200 to-zinc-400",
  },
];

export default function ManageCoursesPage() {
  const [selectedCourseName, setSelectedCourseName] = useState<string | null>(
    null,
  );

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <section className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-secondary text-2xl font-bold">
              Gerenciar Cursos
            </h2>
            <p className="mt-1 text-gray-500">
              Aqui esta o que esta acontecendo com seus cursos hoje.
            </p>
          </div>

          <Link
            href="/admin/cursos/criar"
            className="bg-primary hover:bg-primary-dark inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors sm:w-auto"
          >
            <MdAddCircleOutline size={20} />
            Adicionar Novo Curso
          </Link>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
            <h3 className="font-semibold text-gray-800">Cursos Cadastrados</h3>

            <div className="w-full sm:w-auto">
              <label className="relative block">
                <MdSearch
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Buscar curso..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm text-gray-700 outline-none focus:border-orange-300 sm:w-72"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-gray-100 text-xs font-semibold tracking-[0.12em] text-gray-500 uppercase">
                  <th className="px-6 py-4">Nome do Curso</th>
                  <th className="px-6 py-4">Data de Lancamento</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => (
                  <tr key={course.id} className="text-sm hover:bg-gray-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-lg ${course.thumbClass}`}
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
                      <div className="flex items-center justify-center gap-4 text-gray-400">
                        <Link
                          href={`/admin/cursos/editar/${course.id}`}
                          className="hover:text-blue-500"
                          aria-label={`Editar curso ${course.name}`}
                        >
                          <MdEdit size={19} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedCourseName(course.name)}
                          className="hover:text-red-500"
                          aria-label={`Excluir curso ${course.name}`}
                        >
                          <MdOutlineDelete size={19} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 p-4 text-sm text-gray-500">
            <span>Exibindo 3 de 12 cursos</span>
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
