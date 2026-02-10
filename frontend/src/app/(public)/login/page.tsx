"use client";

import Link from "next/link";
import {
  MdLockOutline,
  MdMusicNote,
  MdOutlineEmail,
  MdStar,
} from "react-icons/md";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

//Components
import { Input } from "@/components/form/Input";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "A senha deve conter pelo menos 6 caracteres"),
});

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  type LoginData = z.infer<typeof loginSchema>;

  const handleLogin = async (data: LoginData) => {
    console.log("Iniciando cadastro...", data);

    // Simula envio de API por 3 segundos
    await new Promise((resolve) => setTimeout(resolve, 3000));

    alert(`Bem-vindo, logado!`);
  };

  return (
    <div className="flex min-h-dvh justify-between bg-white">
      <div className="flex flex-1 flex-col justify-center gap-10 px-5 md:items-center">
        <div className="flex items-center md:hidden">
          <MdMusicNote className="text-primary size-6" />
          <h1 className="text-xl font-bold">AulasViolão</h1>
        </div>
        <div className="flex flex-col gap-5 md:w-md">
          <h1 className="text-secondary text-3xl font-bold">Bem-Vindo</h1>
          <p className="text-base font-normal text-gray-500">
            Insira seus dados para acessar suas aulas.
          </p>
          <form
            onSubmit={handleSubmit(handleLogin)}
            className="flex flex-col gap-5"
          >
            <Input
              label="Email"
              type="email"
              icon={MdOutlineEmail}
              placeholder="email@exemplo.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Senha"
              type="password"
              icon={MdLockOutline}
              placeholder="******"
              error={errors.senha?.message}
              {...register("senha")}
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark active:bg-primary-dark rounded-lg py-5 text-sm font-semibold text-white transition-colors duration-300"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
            <div>
              <p className="flex justify-center gap-1 text-sm">
                Não tem conta?
                <Link
                  href="/register"
                  className="text-primary hover:text-primary-dark active:text-primary-dark"
                >
                  Crie uma conta!
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <div className="bg-secondary hidden min-h-screen bg-[url(/01.jpg)] bg-cover bg-center bg-blend-overlay md:flex md:flex-1">
        <div className="flex size-full flex-col justify-between gap-3.5 p-12">
          <div className="hidden items-center md:flex">
            <MdMusicNote className="text-primary size-6" />
            <h1 className="text-xl font-semibold text-white">AulasViolão</h1>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-primary flex gap-1">
              {Array.from({ length: 6 }).map((_, index) => (
                <MdStar key={index} />
              ))}
            </span>
            <p className="text-lg text-white">
              &quot;Melhor curso de violão, sem <br />
              duvida nenhum recomendo, 10 <br /> estrelas&quot;
            </p>
            <p className="text-sm text-white">Bruno lacerda</p>
          </div>
        </div>
      </div>
    </div>
  );
}
