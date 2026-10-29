"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdOutlineEmail } from "react-icons/md";

//Components
import { Input } from "@/components/form/Input";
import AuthLayout from "@/components/marketing/AuthLayout";
import { forgotPasswordAction } from "@/app/actions/auth";
import { toast } from "@/components/ui/Toast";

const forgotSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ForgotData = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotData>({
    resolver: zodResolver(forgotSchema),
  });

  const handleForgot = async (data: ForgotData) => {
    // A resposta do backend é sempre genérica (anti-enumeração de e-mail),
    // então sempre exibimos a mesma mensagem de sucesso.
    await forgotPasswordAction(data.email);

    toast("Verifique seu e-mail", {
      description:
        "Se houver uma conta com este endereço, enviamos as instruções para redefinir sua senha.",
      variant: "success",
    });
  };

  return (
    <AuthLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-ink text-3xl font-semibold tracking-[-0.01em]">
          Esqueceu a senha?
        </h1>
        <p className="text-ink/60 text-sm leading-relaxed">
          Informe o e-mail da sua conta e enviaremos um link para você criar uma
          nova senha.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(handleForgot)}
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
        <button
          type="submit"
          disabled={isSubmitting}
          className="gradient-animate focus-visible:ring-accent flex h-14 w-full items-center justify-center rounded-full text-sm font-medium text-white shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
          style={{ backgroundImage: "var(--gradient-pulse)" }}
        >
          {isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
        </button>
        <p className="text-ink/70 mt-2 flex gap-1 text-sm">
          Lembrou a senha?{" "}
          <Link
            href="/login"
            className="text-accent hover:text-ink font-medium transition-colors"
          >
            Voltar para o login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
