"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import {
  MdClose,
  MdOutlineDashboard,
  MdLibraryBooks,
  MdMenu,
  MdOutlinePeopleAlt,
  MdOutlineSettings,
  MdOutlineLogout,
} from "react-icons/md";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, setUser } = useUser();

  const displayName = user?.name ?? "Usuário";
  const displayRole =
    user?.role === "admin"
      ? "Administrador"
      : user?.role === "instructor"
        ? "Instrutor"
        : "Painel";

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
      name: "Meu Perfil",
      href: "/admin/perfil",
      icon: MdOutlineSettings,
    },
  ];

  async function handleLogout() {
    await logoutAction();
    setUser(null); // Limpa o estado global do usuário no cliente
    router.push("/login");
  }

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

  const UserAvatar = ({ size = "h-9 w-9" }: { size?: string }) => (
    <div
      className={`relative ${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-600 bg-gradient-to-br from-orange-400 to-amber-600`}
    >
      {user?.urlPhoto ? (
        <Image
          src={user.urlPhoto}
          alt={`Foto de ${displayName}`}
          fill
          className="object-cover"
        />
      ) : (
        <span className="text-xs font-bold text-white">
          {(displayName || "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </span>
      )}
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#2a3150] bg-[#1A1F36] px-4 py-3 text-white lg:hidden">
        <Link href="/admin/perfil" className="flex items-center gap-3">
          <UserAvatar />
          <div className="leading-tight text-left">
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-gray-400">{displayRole}</p>
          </div>
        </Link>

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
              <Link href="/admin/perfil" className="flex items-center gap-3">
                <UserAvatar />
                <div className="leading-tight text-left">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-gray-400">{displayRole}</p>
                </div>
              </Link>

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
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-gray-300 transition-colors hover:bg-white/5 hover:text-red-400"
              >
                <MdOutlineLogout size={20} className="text-gray-400" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <aside className="hidden h-screen w-64 shrink-0 flex-col bg-[#1A1F36] text-white lg:flex">
        <Link href="/admin/perfil" className="flex items-center gap-3 p-6 pt-8 hover:bg-white/5 transition-colors">
          <UserAvatar size="h-10 w-10" />
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold tracking-wide">{displayName}</span>
            <span className="text-xs text-gray-400">{displayRole}</span>
          </div>
        </Link>

        {renderNavLinks()}

        <div className="border-t border-gray-800 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-gray-300 transition-colors hover:bg-white/5 hover:text-red-400"
          >
            <MdOutlineLogout size={20} className="text-gray-400" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
