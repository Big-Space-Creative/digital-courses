"use client";
import Image from "next/image";
import PulseWave from "@/components/brand/PulseWave";
import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { toast } from "../ui/Toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import ThemeToggle from "@/components/marketing/ThemeToggle";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, setUser } = useUser();

  const profile = {
    name: user?.name ?? "Aluno",
    subscriptionType: user?.subscriptionType ?? "Free",
    urlPhoto:
      user?.urlPhoto ||
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  };

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

  return (
    <header className="bg-surface-soft border-ink/8 flex items-center justify-between border-b px-6 py-4 md:px-20">
      <Link href="/aluno/home" className="flex items-center gap-2.5">
        <PulseWave className="pulse-glow h-8 w-8" title="" />
        <span className="text-ink text-lg font-semibold tracking-tight">
          Pullse
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="hidden flex-col items-end sm:flex">
          <p className="text-ink text-sm font-medium">{profile.name}</p>
          <p className="text-ink/50 text-xs">
            Plano {profile.subscriptionType}
          </p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="border-accent/60 relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 transition-opacity hover:opacity-90"
          >
            <Image
              src={profile.urlPhoto}
              alt="Foto de perfil"
              fill
              className="object-cover"
              quality={60}
            />
          </button>
          {isMenuOpen && (
            <div className="border-ink/10 bg-surface-soft rounded-bento-md absolute right-0 z-50 mt-2 w-48 overflow-hidden border shadow-lg">
              <div className="flex flex-col">
                <Link
                  href="/aluno/perfil"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-ink hover:bg-ink/5 px-4 py-3 text-left text-sm transition-colors"
                >
                  Ver perfil
                </Link>

                <hr className="border-ink/10" />

                <button
                  onClick={() => handleLogout()}
                  className="cursor-pointer px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Sair da conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
