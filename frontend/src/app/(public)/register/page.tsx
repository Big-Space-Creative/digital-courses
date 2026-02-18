"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MdLockOutline,
  MdMusicNote,
  MdOutlineEmail,
  MdOutlinePersonOutline,
  MdStar,
} from "react-icons/md";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

//Components
import { Input } from "@/components/form/Input";
import { registerAction } from "@/app/actions/auth";
import { toast } from "@/components/ui/toast";

const registerSchema = z
  .object({
    nome: z.string().min(2, "O nome deve conter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    senha: z.string().min(8, "A senha deve conter pelo menos 8 caracteres"),
    confirmaSenha: z
      .string()
      .min(8, "A senha deve conter pelo menos 8 caracteres"),
  })
  .refine((data) => data.senha === data.confirmaSenha, {
    message: "Senhas não conhecidem",
    path: ["confirmaSenha"],
  });

export default function Register() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  type RegisterData = z.infer<typeof registerSchema>;

  const handleFillRandom = () => {
    const rand = Math.random().toString(36).slice(2, 8);
    const senha = `Aula@${rand}`;

    setValue("nome", `Teste ${rand}`);
    setValue("email", `teste.${rand}@example.com`);
    setValue("senha", senha);
    setValue("confirmaSenha", senha);
  };

  const handleRegister = async (data: RegisterData) => {
    const res = await registerAction(data);

    if (res.error) {
      toast("Nao foi possivel cadastrar", {
        description: res.error,
        variant: "error",
      });
      return;
    }

    toast("Cadastro realizado", {
      description: "Agora voce pode entrar com sua conta.",
      variant: "success",
    });
    router.push("/login");
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
            Insira seus dados para o cadastro.
          </p>
          <form
            onSubmit={handleSubmit(handleRegister)}
            className="flex flex-col gap-5"
          >
            <Input
              label="Nome"
              type="text"
              icon={MdOutlinePersonOutline}
              placeholder="Nome Completo"
              error={errors.nome?.message}
              {...register("nome")}
            />
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
            <Input
              label="Confirma Senha"
              type="password"
              icon={MdLockOutline}
              placeholder="******"
              error={errors.confirmaSenha?.message}
              {...register("confirmaSenha")}
            />
            <button
              type="button"
              onClick={handleFillRandom}
              className="text-primary hover:text-primary-dark active:text-primary-dark border-primary/20 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors"
            >
              Preencher dados de teste
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark active:bg-primary-dark rounded-lg py-5 text-sm font-semibold text-white transition-colors duration-300"
            >
              {isSubmitting ? "Cadastrando..." : "Cadastre-se"}
            </button>
            <div>
              <p className="flex justify-center gap-1 text-sm">
                Já tem conta?
                <Link
                  href="/login"
                  className="text-primary hover:text-primary-dark active:text-primary-dark"
                >
                  Clique aqui!
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
