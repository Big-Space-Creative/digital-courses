"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdLockOutline, MdOutlineEmail, MdHelpOutline } from "react-icons/md";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

//Components
import { Input } from "@/components/form/Input";
import AuthLayout from "@/components/marketing/AuthLayout";
import { loginAction } from "@/app/actions/auth";
import { toast } from "@/components/ui/Toast";
import { useUser } from "@/context/UserContext";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(8, "A senha deve conter pelo menos 8 caracteres"),
});

export default function Login() {
  const router = useRouter();
  const { setUser } = useUser();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  type LoginData = z.infer<typeof loginSchema>;

  const handleLogin = async (data: LoginData) => {
    const res = await loginAction(data);

    if (res.error) {
      // E-mail não verificado → informa o usuário e redireciona para tela de verificação
      if ("email_not_verified" in res && res.email_not_verified) {
        toast("Confirme seu e-mail", {
          description:
            "Acesse sua caixa de entrada e clique no link de verificação para ativar sua conta.",
          variant: "info",
        });
        // Pequeno delay para o usuário conseguir ler o toast antes do redirect
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        }, 1500);
        return;
      }

      toast("Não foi possível realizar Login", {
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
    <AuthLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-ink text-3xl font-semibold tracking-[-0.01em]">
          Bem-vindo de volta
        </h1>
        <p className="text-ink/60 text-sm leading-relaxed">
          Insira seus dados para acessar suas aulas.
        </p>
      </div>
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
        <Link
          href="/esqueci-senha"
          className="text-accent hover:text-ink -mt-2 self-end text-sm font-medium transition-colors"
        >
          Esqueci minha senha
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="gradient-animate focus-visible:ring-accent flex h-14 w-full items-center justify-center rounded-full text-sm font-medium text-white shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
          style={{ backgroundImage: "var(--gradient-pulse)" }}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-ink/70 flex gap-1 text-sm">
            Não tem conta?
            <Link
              href="/register"
              className="text-accent hover:text-ink font-medium transition-colors"
            >
              Crie uma conta!
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
