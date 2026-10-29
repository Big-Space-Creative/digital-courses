"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdHelpOutline, MdLockOutline, MdOutlineEmail } from "react-icons/md";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import AuthLayout from "@/components/marketing/AuthLayout";
import { loginAction } from "@/app/actions/auth";
import { toast } from "@/components/ui/Toast";
import { useUser } from "@/context/UserContext";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(8, "A senha deve conter pelo menos 8 caracteres"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const { setUser } = useUser();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (data: LoginData) => {
    const res = await loginAction(data);

    if (res.error) {
      if ("email_not_verified" in res && res.email_not_verified) {
        toast("Confirme seu e-mail", {
          description:
            "Acesse sua caixa de entrada e clique no link de verificação para ativar sua conta.",
          variant: "info",
        });
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        }, 1500);
        return;
      }

      toast("Não foi possível realizar o login", {
        description: res.error,
        variant: "error",
      });
      return;
    }

    toast("Login realizado com sucesso", {
      description: "Agora você pode acessar seus cursos.",
      variant: "success",
    });

    setUser(res.user ?? null);
    router.push("/aluno/home");
  };

  return (
    <AuthLayout contextType="login">
      <div className="flex flex-col gap-2">
        <h1 className="text-text text-3xl font-semibold tracking-tight">
          Bem-vindo de volta
        </h1>
        <p className="text-text-muted text-sm leading-relaxed">
          Insira seus dados para acessar sua área de estudos.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleLogin)}
        className="mt-6 flex flex-col gap-4"
        noValidate
      >
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          icon={MdOutlineEmail}
          placeholder="email@exemplo.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            icon={MdLockOutline}
            placeholder="Sua senha secreta"
            error={errors.senha?.message}
            {...register("senha")}
          />
          <div className="mt-1 flex justify-end">
            <Link
              href="/esqueci-senha"
              className="text-accent-text hover:text-text focus-visible:ring-accent rounded-sm text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="mt-2 w-full font-semibold"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-4">
          <p className="text-text-muted text-sm">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="text-accent-text hover:text-text focus-visible:ring-accent font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Cadastre-se
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
