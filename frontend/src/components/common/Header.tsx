"use client";
import Image from "next/image";
import Logo from "./Logo";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const user = {
    name: "João Silva",
    email: "jãozin@gmail.com",
    plan: "Premium",
    urlPhoto:
      "https://images.unsplash.com/photo-1654110455429-cf322b40a906?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  };

  return (
    <header className="bg-secondary flex items-center justify-between px-6 py-4 md:px-20">
      <Logo />
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <p className="text-base text-white">Arthur</p>
          <p className="text-sm text-white/60">Plano premium</p>
        </div>
        <div className="relative">
          <div
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="border-primary relative size-12 cursor-pointer overflow-hidden rounded-full border-2"
          >
            <Image
              src={user.urlPhoto}
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
                  onClick={() => console.log("Logout")}
                  className="px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
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
