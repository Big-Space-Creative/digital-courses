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
    <nav aria-label="Navegação do painel" className="mt-2 flex-1 space-y-1 px-3">
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
            aria-current={isActive ? "page" : undefined}
            className={`rounded-bento-sm focus-visible:ring-accent flex items-center gap-3 px-3.5 py-3 text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none ${
              isActive
                ? "bg-accent text-accent-ink"
                : "text-ink/75 hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <Icon
              size={20}
              aria-hidden="true"
              className={isActive ? "text-accent-ink" : "text-ink/55"}
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  const renderAvatar = (size = "h-9 w-9") => (
    <div
      className={`relative ${size} bg-accent/15 text-accent-ink flex shrink-0 items-center justify-center overflow-hidden rounded-full`}
    >
      {user?.urlPhoto ? (
        <Image
          src={user.urlPhoto}
          alt={`Foto de ${displayName}`}
          fill
          className="object-cover"
        />
      ) : (
        <span className="text-xs font-semibold">
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

  const logoutButton = (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-bento-sm text-ink/75 focus-visible:ring-accent flex w-full items-center gap-3 px-3.5 py-3 text-sm font-medium transition-colors duration-150 hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:outline-none"
    >
      <MdOutlineLogout size={20} aria-hidden="true" className="text-ink/55" />
      <span>Sair</span>
    </button>
  );

  return (
    <>
      <header className="glass-strong border-ink/10 sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 lg:hidden">
        <Link href="/admin/perfil" className="flex items-center gap-3">
          {renderAvatar()}
          <div className="text-left leading-tight">
            <p className="text-ink text-sm font-semibold">{displayName}</p>
            <p className="text-ink/65 text-xs">{displayRole}</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-ink/80 hover:bg-ink/5 focus-visible:ring-accent rounded-lg p-2.5 focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Abrir menu"
        >
          <MdMenu size={22} />
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="bg-ink/40 absolute inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Fechar menu"
          />

          <aside className="bg-surface-soft text-ink relative z-10 flex h-full w-72 max-w-[86vw] flex-col shadow-xl">
            <div className="border-ink/10 flex items-center justify-between border-b p-4">
              <Link href="/admin/perfil" className="flex items-center gap-3">
                {renderAvatar()}
                <div className="text-left leading-tight">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-ink/65 text-xs">{displayRole}</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-ink/80 hover:bg-ink/5 focus-visible:ring-accent rounded-lg p-2.5 focus-visible:ring-2 focus-visible:outline-none"
                aria-label="Fechar menu"
              >
                <MdClose size={20} />
              </button>
            </div>

            {renderNavLinks(() => setIsMobileMenuOpen(false))}

            <div className="border-ink/10 border-t p-3">{logoutButton}</div>
          </aside>
        </div>
      )}

      <aside className="bg-surface-soft border-ink/10 text-ink hidden h-screen w-64 shrink-0 flex-col border-r lg:flex">
        <Link
          href="/admin/perfil"
          className="hover:bg-ink/5 focus-visible:ring-accent m-3 mt-5 flex items-center gap-3 rounded-bento-sm p-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          {renderAvatar("h-10 w-10")}
          <div className="flex min-w-0 flex-col text-left">
            <span className="truncate text-sm font-semibold">{displayName}</span>
            <span className="text-ink/65 text-xs">{displayRole}</span>
          </div>
        </Link>

        {renderNavLinks()}

        <div className="border-ink/10 border-t p-3">{logoutButton}</div>
      </aside>
    </>
  );
}
