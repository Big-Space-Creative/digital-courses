"use client";
import Image from "next/image";
import Logo from "./Logo";
import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { toast } from "../ui/Toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, setUser } = useUser();

  const profile = {
    name: user?.name ?? "Aluno",
    plan: user?.plan ?? "Free",
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
    <header className="bg-secondary flex items-center justify-between px-6 py-4 md:px-20">
      <Logo />
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <p className="text-base text-white">{profile.name}</p>
          <p className="text-sm text-white/60">Plano {profile.plan}</p>
        </div>
        <div className="relative">
          <div
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="border-primary relative size-12 cursor-pointer overflow-hidden rounded-full border-2"
          >
            <Image
              src={profile.urlPhoto}
              alt="foto"
              fill
              className="object-cover"
              quality={60}
            />
          </div>
          {isMenuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/5">
              <div className="flex flex-col">
                <Link
                  href="/aluno/perfil"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-secondary px-4 py-3 text-left text-sm transition-colors hover:bg-gray-100"
                >
                  Ver perfil
                </Link>

                <hr className="border-gray-100" />

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
