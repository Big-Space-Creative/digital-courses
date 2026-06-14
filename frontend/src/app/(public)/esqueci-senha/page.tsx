"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdMusicNote, MdOutlineEmail } from "react-icons/md";

//Components
import { Input } from "@/components/form/Input";
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
    <div className="flex min-h-dvh items-center justify-center px-5">
      <div className="flex w-full flex-col gap-5 md:w-md">
        <div className="flex items-center">
          <MdMusicNote className="text-primary size-6" />
          <h1 className="text-xl font-bold">AulasViolão</h1>
        </div>
        <h1 className="text-secondary text-3xl font-bold">Esqueceu a senha?</h1>
        <p className="text-base font-normal text-gray-500">
          Informe o e-mail da sua conta e enviaremos um link para você criar uma
          nova senha.
        </p>
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
            className="bg-primary hover:bg-primary-dark active:bg-primary-dark rounded-lg py-5 text-sm font-semibold text-white transition-colors duration-300 disabled:opacity-60"
          >
            {isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
          </button>
          <p className="mt-2 text-sm">
            Lembrou a senha?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary-dark active:text-primary-dark"
            >
              Voltar para o login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
