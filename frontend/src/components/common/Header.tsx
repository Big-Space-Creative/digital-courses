"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import PullseLogo from "@/components/brand/PullseLogo";
import ThemeToggle from "@/components/marketing/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { logoutAction } from "@/app/actions/auth";
import { toast } from "@/components/ui/Toast";
import { useUser } from "@/context/UserContext";
import {
  MdOutlineExitToApp,
  MdOutlinePerson,
  MdOutlineSchool,
} from "react-icons/md";

function getInitials(name?: string | null): string {
  if (!name) return "AL";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const profile = {
    name: user?.name ?? "Aluno",
    email: user?.email ?? "",
    subscriptionType: user?.subscriptionType ?? "free",
    urlPhoto: user?.urlPhoto,
  };

  // Q19: Só usar fallback quando não houver URL válida cadastrada
  const showPhoto = Boolean(profile.urlPhoto && profile.urlPhoto.trim() !== "");
  const initials = getInitials(profile.name);

  // Close disclosure menu on click outside or escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
        buttonRef.current?.focus();
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    const res = await logoutAction();
    toast(res.message, {
      description: "Volte logo! Seus cursos estarão te esperando.",
      variant: "success",
    });
    setUser(null);
    setIsMenuOpen(false);
    router.push("/login");
    router.refresh();
  };

  const isCourseActive =
    pathname.startsWith("/aluno/home") || pathname.startsWith("/aluno/aula");
  const isProfileActive = pathname.startsWith("/aluno/perfil");

  return (
    <header className="border-border bg-panel/95 sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Main Nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/aluno/home"
            className="focus-visible:ring-accent flex items-center gap-2.5 rounded-[var(--radius-control)] outline-none focus-visible:ring-2"
          >
            <PullseLogo className="text-text h-10 w-auto" title="Pullse" />
          </Link>

          {/* Explicit Navigation Links */}
          <nav
            aria-label="Navegação da área do aluno"
            className="hidden items-center gap-1 md:flex"
          >
            <Link
              href="/aluno/home"
              aria-current={isCourseActive ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-medium transition-colors ${
                isCourseActive
                  ? "bg-accent/10 text-accent-text font-semibold"
                  : "text-text-muted hover:bg-canvas hover:text-text"
              }`}
            >
              <MdOutlineSchool className="size-4" aria-hidden="true" />
              <span>Meu curso</span>
            </Link>

            <Link
              href="/aluno/perfil"
              aria-current={isProfileActive ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-medium transition-colors ${
                isProfileActive
                  ? "bg-accent/10 text-accent-text font-semibold"
                  : "text-text-muted hover:bg-canvas hover:text-text"
              }`}
            >
              <MdOutlinePerson className="size-4" aria-hidden="true" />
              <span>Minha conta</span>
            </Link>
          </nav>
        </div>

        {/* Right side: Theme toggle + user menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          {/* User info on desktop */}
          <div className="hidden flex-col items-end text-right sm:flex">
            <span className="text-text text-sm leading-tight font-medium">
              {profile.name}
            </span>
            <div className="mt-0.5">
              <Badge
                variant={
                  profile.subscriptionType.toLowerCase() === "premium"
                    ? "accent"
                    : "neutral"
                }
                className="px-1.5 py-0.5 text-xs font-semibold uppercase"
              >
                {profile.subscriptionType}
              </Badge>
            </div>
          </div>

          {/* Avatar & Disclosure Dropdown (Q06: sem role menu) */}
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-controls="aluno-user-dropdown"
              aria-expanded={isMenuOpen}
              aria-label="Menu da conta do aluno"
              className="border-border focus-visible:ring-accent relative flex size-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              {showPhoto && profile.urlPhoto ? (
                <Image
                  src={profile.urlPhoto}
                  alt={`Foto de ${profile.name}`}
                  fill
                  sizes="40px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span className="bg-accent/15 text-accent-text flex size-full items-center justify-center text-xs font-bold">
                  {initials}
                </span>
              )}
            </button>

            {isMenuOpen && (
              <div
                id="aluno-user-dropdown"
                ref={menuRef}
                className="border-border bg-panel animate-in fade-in-50 zoom-in-95 absolute right-0 mt-2 w-60 origin-top-right rounded-[var(--radius-panel)] border p-1.5 shadow-[var(--shadow-overlay)] duration-150 focus:outline-none"
              >
                {/* Header in dropdown */}
                <div className="border-border border-b px-3 py-2.5">
                  <p className="text-text truncate text-sm font-semibold">
                    {profile.name}
                  </p>
                  {profile.email && (
                    <p className="text-text-muted truncate text-xs">
                      {profile.email}
                    </p>
                  )}
                  <div className="mt-1.5">
                    <Badge
                      variant={
                        profile.subscriptionType.toLowerCase() === "premium"
                          ? "accent"
                          : "neutral"
                      }
                      className="text-xs uppercase"
                    >
                      Plano {profile.subscriptionType}
                    </Badge>
                  </div>
                </div>

                {/* Navigation items (Q06: links simples com aria-current) */}
                <div className="py-1">
                  <Link
                    href="/aluno/home"
                    aria-current={isCourseActive ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-text hover:bg-canvas flex w-full items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2 text-sm transition-colors"
                  >
                    <MdOutlineSchool className="text-accent-text size-4" />
                    <span>Meu curso</span>
                  </Link>

                  <Link
                    href="/aluno/perfil"
                    aria-current={isProfileActive ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-text hover:bg-canvas flex w-full items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2 text-sm transition-colors"
                  >
                    <MdOutlinePerson className="text-accent-text size-4" />
                    <span>Configurações da conta</span>
                  </Link>
                </div>

                <div className="border-border border-t pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-danger hover:bg-danger/10 flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2 text-left text-sm font-medium transition-colors"
                  >
                    <MdOutlineExitToApp className="size-4" />
                    <span>Sair da conta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
