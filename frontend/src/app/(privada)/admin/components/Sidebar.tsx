"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  MdClose,
  MdOutlineDashboard,
  MdLibraryBooks,
  MdMenu,
  MdOutlinePeopleAlt,
  MdOutlineSettings,
  MdOutlineLogout,
} from "react-icons/md";

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const renderNavLinks = (onClick?: () => void) => (
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
            onClick={onClick}
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
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#2a3150] bg-[#1A1F36] px-4 py-3 text-white lg:hidden">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-gray-600">
            <Image
              src="https://images.unsplash.com/photo-1773633071680-a1b53fcb4e90?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Foto de perfil de Ramon"
              fill
              className="object-cover"
            />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Ramon&apos;s Guitar</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="rounded-md p-2 text-gray-200 hover:bg-white/10"
          aria-label="Abrir menu"
        >
          <MdMenu size={22} />
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Fechar menu"
          />

          <aside className="relative z-10 flex h-full w-72 max-w-[86vw] flex-col bg-[#1A1F36] text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2a3150] p-4">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-gray-600">
                  <Image
                    src="https://images.unsplash.com/photo-1773633071680-a1b53fcb4e90?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Foto de perfil de Ramon"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">Ramon&apos;s Guitar</p>
                  <p className="text-xs text-gray-400">Admin Panel</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md p-2 text-gray-200 hover:bg-white/10"
                aria-label="Fechar menu"
              >
                <MdClose size={20} />
              </button>
            </div>

            {renderNavLinks(() => setIsMobileMenuOpen(false))}

            <div className="border-t border-gray-800 p-4">
              <button className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-gray-300 transition-colors hover:bg-white/5 hover:text-red-400">
                <MdOutlineLogout size={20} className="text-gray-400" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <aside className="hidden h-screen w-64 shrink-0 flex-col bg-[#1A1F36] text-white lg:flex">
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

        {renderNavLinks()}

        <div className="border-t border-gray-800 p-4">
          <button className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-gray-300 transition-colors hover:bg-white/5 hover:text-red-400">
            <MdOutlineLogout size={20} className="text-gray-400" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
