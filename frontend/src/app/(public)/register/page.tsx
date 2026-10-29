"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MdHelpOutline,
  MdLockOutline,
  MdOutlineEmail,
  MdOutlinePersonOutline,
} from "react-icons/md";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import AuthLayout from "@/components/marketing/AuthLayout";
import { registerAction } from "@/app/actions/auth";
import { toast } from "@/components/ui/Toast";

const registerSchema = z
  .object({
    nome: z.string().min(2, "O nome deve conter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    senha: z.string().min(8, "A senha deve conter pelo menos 8 caracteres"),
    confirmaSenha: z
      .string()
      .min(8, "A confirmação deve conter pelo menos 8 caracteres"),
    aceitaTermos: z.literal(true, {
      error:
        "Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.",
    }),
  })
  .refine((data) => data.senha === data.confirmaSenha, {
    message: "As senhas não coincidem",
    path: ["confirmaSenha"],
  });

type RegisterData = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const handleRegister = async (data: RegisterData) => {
    const res = await registerAction({
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      confirmaSenha: data.confirmaSenha,
    });

    if (res.error) {
      toast("Não foi possível cadastrar", {
        description: res.error,
        variant: "error",
      });
      return;
    }

    toast("Cadastro realizado com sucesso!", {
      description: "Verifique seu e-mail para ativar sua conta.",
      variant: "success",
    });

    router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
  };

  return (
    <AuthLayout contextType="register">
      <div className="flex flex-col gap-2">
        <h1 className="text-text text-3xl font-semibold tracking-tight">
          Crie sua conta
        </h1>
        <p className="text-text-muted text-sm leading-relaxed">
          Comece agora sua trilha de aprendizado prático de violão.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleRegister)}
        className="mt-6 flex flex-col gap-4"
        noValidate
      >
        <Input
          label="Nome completo"
          type="text"
          autoComplete="name"
          icon={MdOutlinePersonOutline}
          placeholder="Seu nome"
          error={errors.nome?.message}
          {...register("nome")}
        />

        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          icon={MdOutlineEmail}
          placeholder="email@exemplo.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          icon={MdLockOutline}
          placeholder="No mínimo 8 caracteres"
          error={errors.senha?.message}
          {...register("senha")}
        />

        <Input
          label="Confirme sua senha"
          type="password"
          autoComplete="new-password"
          icon={MdLockOutline}
          placeholder="Repita a senha digitada"
          error={errors.confirmaSenha?.message}
          {...register("confirmaSenha")}
        />

        {/* Aceite de Termos — Exigência legal LGPD Art. 8º com primitivo Checkbox */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3.5">
          <Checkbox
            id="aceitaTermos"
            error={errors.aceitaTermos?.message}
            {...register("aceitaTermos")}
            label={
              <span className="text-text text-xs leading-relaxed">
                Eu li e aceito os{" "}
                <Link
                  href="/termos-de-uso"
                  target="_blank"
                  className="text-accent-text hover:text-text font-semibold underline underline-offset-2 transition-colors"
                >
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link
                  href="/politica-de-privacidade"
                  target="_blank"
                  className="text-accent-text hover:text-text font-semibold underline underline-offset-2 transition-colors"
                >
                  Política de Privacidade
                </Link>
                .
              </span>
            }
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="mt-2 w-full font-semibold"
        >
          {isSubmitting ? "Criando conta..." : "Criar minha conta"}
        </Button>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-4">
          <p className="text-text-muted text-sm">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="text-accent-text hover:text-text focus-visible:ring-accent font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Entrar
            </Link>
          </p>

          <button
            type="button"
            onClick={() => {
              toast("Precisa de ajuda?", {
                description: `Entre em contato conosco: ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "contato@pullse.com.br"}`,
                variant: "info",
              });
            }}
            className="text-text-muted hover:text-accent-text focus-visible:ring-accent flex min-h-[44px] items-center gap-1.5 rounded-sm text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <MdHelpOutline size={16} aria-hidden="true" />
            <span>Ajuda</span>
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
