"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdOutlineDashboard,
  MdLibraryBooks,
  MdOutlinePeopleAlt,
  MdOutlineSettings,
  MdOutlineLogout,
} from "react-icons/md";

export default function Sidebar() {
  const pathname = usePathname();

  // Lista de links para facilitar a manutenção e renderização
  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: MdOutlineDashboard },
    {
      name: "Gerenciar Cursos",
      href: "/admin/cursos/gerenciar",
      icon: MdLibraryBooks,
    },
    { name: "Alunos", href: "/admin/alunos", icon: MdOutlinePeopleAlt },
    {
      name: "Configurações",
      href: "/admin/configuracoes",
      icon: MdOutlineSettings,
    },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#1A1F36] text-white">
      {/* Perfil Header */}
      <div className="flex items-center gap-3 p-6 pt-8">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-600">
          <Image
            src="https://images.unsplash.com/photo-1773633071680-a1b53fcb4e90?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Foto de perfil de Ramon"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wide">
            Ramon&apos;s Guitar
          </span>
          <span className="text-xs text-gray-400">Admin Panel</span>
        </div>
      </div>

      {/* Menu de Navegação */}
      <nav className="mt-4 flex-1 space-y-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isCoursesRoute = item.href.includes("/admin/cursos");
          const isActive = isCoursesRoute
            ? pathname.startsWith("/admin/cursos")
            : pathname === item.href ||
              (pathname === "/" && item.href === "/dashboard");

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-4 py-3 transition-colors ${
                isActive
                  ? "rounded-l-none border-l-4 border-[#F26A21] bg-white/5 text-[#F26A21]"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                size={20}
                className={isActive ? "text-[#F26A21]" : "text-gray-400"}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Rodapé / Botão Sair */}
      <div className="border-t border-gray-800 p-4">
        <button className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-gray-300 transition-colors hover:bg-white/5 hover:text-red-400">
          <MdOutlineLogout size={20} className="text-gray-400" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
