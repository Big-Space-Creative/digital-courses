"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MdLockOutline,
  MdOutlineEmail,
  MdOutlinePersonOutline,
  MdHelpOutline,
} from "react-icons/md";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

//Components
import { Input } from "@/components/form/Input";
import AuthLayout from "@/components/marketing/AuthLayout";
import { registerAction } from "@/app/actions/auth";
import { toast } from "@/components/ui/Toast";

const registerSchema = z
  .object({
    nome: z.string().min(2, "O nome deve conter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    senha: z.string().min(8, "A senha deve conter pelo menos 8 caracteres"),
    confirmaSenha: z
      .string()
      .min(8, "A senha deve conter pelo menos 8 caracteres"),
    aceitaTermos: z.literal(true, {
      error: "Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.",
    }),
  })
  .refine((data) => data.senha === data.confirmaSenha, {
    message: "As senhas não coincidem",
    path: ["confirmaSenha"],
  });

export default function Register() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  type RegisterData = z.infer<typeof registerSchema>;



  const handleRegister = async (data: RegisterData) => {
    const res = await registerAction({
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      confirmaSenha: data.confirmaSenha,
    });

    if (res.error) {
      toast("Nao foi possivel cadastrar", {
        description: res.error,
        variant: "error",
      });
      return;
    }

    toast("Cadastro realizado!", {
      description: "Verifique seu e-mail para ativar sua conta.",
      variant: "success",
    });
    // Redireciona para a página de verificação passando o e-mail como parâmetro
    router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
  };

  return (
    <AuthLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-ink text-3xl font-semibold tracking-[-0.01em]">
          Crie sua conta
        </h1>
        <p className="text-ink/60 text-sm leading-relaxed">
          Insira seus dados para começar sua trilha de aprendizado.
        </p>
      </div>
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

        {/* Aceite de Termos — exigido pela LGPD Art. 8º */}
        <div className="border-ink/10 bg-surface-soft rounded-bento-sm border p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              {...register("aceitaTermos")}
              className="accent-[var(--color-accent)] mt-0.5 h-4 w-4 shrink-0 cursor-pointer"
            />
            <span className="text-ink/70 text-sm leading-relaxed">
              Eu li e aceito os{" "}
              <Link
                href="/termos-de-uso"
                target="_blank"
                className="text-ink hover:text-accent font-semibold underline transition-colors"
              >
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link
                href="/politica-de-privacidade"
                target="_blank"
                className="text-ink hover:text-accent font-semibold underline transition-colors"
              >
                Política de Privacidade
              </Link>
              .
            </span>
          </label>
          {errors.aceitaTermos && (
            <p className="mt-2 text-xs text-red-500">
              {errors.aceitaTermos.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="gradient-animate focus-visible:ring-accent flex h-14 w-full items-center justify-center rounded-full text-sm font-medium text-white shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
          style={{ backgroundImage: "var(--gradient-pulse)" }}
        >
          {isSubmitting ? "Cadastrando..." : "Cadastre-se"}
        </button>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-ink/70 flex gap-1 text-sm">
            Já tem conta?
            <Link
              href="/login"
              className="text-accent hover:text-ink font-medium transition-colors"
            >
              Clique aqui!
            </Link>
          </p>
          <button
            type="button"
            onClick={() => {
              toast("Precisa de ajuda?", {
                description: `Entre em contato conosco: ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`,
                variant: "info",
              });
            }}
            className="text-ink/50 hover:text-accent flex items-center gap-1 text-sm transition-colors"
            title="Atendimento ao cliente"
          >
            <MdHelpOutline size={18} /> Ajuda
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
