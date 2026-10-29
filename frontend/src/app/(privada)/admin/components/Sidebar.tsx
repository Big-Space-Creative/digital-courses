"use client";
import Image from "next/image";
import Link from "next/link";
import PullseLogo from "@/components/brand/PullseLogo";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import {
  MdOutlineDashboard,
  MdLibraryBooks,
  MdMenu,
  MdOutlinePeopleAlt,
  MdOutlineSettings,
  MdOutlineLogout,
  MdArrowOutward,
} from "react-icons/md";
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useUser();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const name = user?.name ?? "Usuário";
  const role =
    user?.role === "admin"
      ? "Administrador"
      : user?.role === "instructor"
        ? "Instrutor"
        : "Painel";
  const links = [
    { name: "Visão geral", href: "/admin/dashboard", icon: MdOutlineDashboard },
    { name: "Cursos", href: "/admin/cursos/gerenciar", icon: MdLibraryBooks },
    { name: "Usuários", href: "/admin/alunos", icon: MdOutlinePeopleAlt },
    { name: "Minha conta", href: "/admin/perfil", icon: MdOutlineSettings },
  ];
  async function logout() {
    if (
      leaving ||
      !window.dispatchEvent(new Event("admin:leave", { cancelable: true }))
    )
      return;
    setLeaving(true);
    setError("");
    try {
      await logoutAction();
      setUser(null);
      router.push("/login");
    } catch {
      setError("Não foi possível sair. Tente novamente.");
      setLeaving(false);
    }
  }
  const brand = (
    <Link
      href="/admin/dashboard"
      onClick={() => setOpen(false)}
      className="focus-visible:outline-accent inline-flex min-h-11 items-center gap-2 rounded-xl text-xl font-semibold tracking-tight focus-visible:outline-2"
    >
      <PullseLogo className="text-text h-10 w-auto" title="Pullse" />
      <span className="text-text-muted ml-1 text-xs font-normal tracking-normal">
        Admin
      </span>
    </Link>
  );
  const nav = (
    <>
      <nav
        aria-label="Navegação da administração"
        className="flex-1 space-y-1 py-5"
      >
        {links.map((item) => {
          const Icon = item.icon;
          const active = item.href.includes("/cursos")
            ? pathname.startsWith("/admin/cursos")
            : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`focus-visible:outline-accent flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium focus-visible:outline-2 ${active ? "bg-accent text-on-accent" : "text-text-muted hover:bg-canvas hover:text-text"}`}
            >
              <Icon size={20} aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-border space-y-3 border-t pt-4">
        <Link
          href="/aluno/home"
          onClick={() => setOpen(false)}
          className="text-text-muted hover:bg-canvas focus-visible:outline-accent flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-medium focus-visible:outline-2"
        >
          Ver como aluno
          <MdArrowOutward aria-hidden="true" />
        </Link>
        <Link
          href="/admin/perfil"
          onClick={() => setOpen(false)}
          className="focus-visible:outline-accent flex min-h-11 min-w-0 items-center gap-3 rounded-xl px-3 py-2 focus-visible:outline-2"
        >
          <span className="bg-canvas relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold">
            {user?.urlPhoto ? (
              <Image
                src={user.urlPhoto}
                alt=""
                fill
                sizes="36px"
                className="object-cover"
              />
            ) : (
              name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{name}</span>
            <span className="text-text-muted block text-xs">{role}</span>
          </span>
        </Link>
        {error && (
          <p role="alert" className="text-danger text-sm">
            {error}
          </p>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start"
          loading={leaving}
          onClick={() => void logout()}
        >
          <MdOutlineLogout aria-hidden="true" />
          Sair
        </Button>
      </div>
    </>
  );
  return (
    <>
      <header className="glass-header border-border sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 lg:hidden">
        {brand}
        <Button
          variant="ghost"
          aria-label="Abrir navegação"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <MdMenu size={22} aria-hidden="true" />
        </Button>
      </header>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Navegação da administração"
        className="lg:hidden"
      >
        <div className="mt-3 flex min-h-[60vh] flex-col">
          {brand}
          {nav}
        </div>
      </Dialog>
      <aside className="border-border bg-panel hidden h-screen w-60 shrink-0 flex-col border-r p-4 lg:flex">
        <div className="px-2 pt-2">{brand}</div>
        {nav}
      </aside>
    </>
  );
}
