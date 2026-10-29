"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdArrowBack, MdOutlineEmail } from "react-icons/md";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import AuthLayout from "@/components/marketing/AuthLayout";
import { forgotPasswordAction } from "@/app/actions/auth";
import { toast } from "@/components/ui/Toast";

const forgotSchema = z.object({
  email: z.string().email("E-mail inválido"),
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
    await forgotPasswordAction(data.email);

    toast("Verifique seu e-mail", {
      description:
        "Se houver uma conta vinculada a este endereço, enviamos instruções para você criar uma nova senha.",
      variant: "success",
    });
  };

  return (
    <AuthLayout contextType="recovery">
      <div className="flex flex-col gap-2">
        <h1 className="text-text text-3xl font-semibold tracking-tight">
          Esqueceu a senha?
        </h1>
        <p className="text-text-muted text-sm leading-relaxed">
          Informe seu e-mail cadastrado e enviaremos um link seguro para
          redefinição.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleForgot)}
        className="mt-6 flex flex-col gap-4"
        noValidate
      >
        <Input
          label="E-mail cadastrado"
          type="email"
          autoComplete="email"
          icon={MdOutlineEmail}
          placeholder="email@exemplo.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="mt-2 w-full font-semibold"
        >
          {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
        </Button>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
          <Link
            href="/login"
            className="text-text-muted hover:text-text focus-visible:ring-accent flex min-h-[44px] items-center gap-1.5 rounded-sm text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <MdArrowBack size={18} aria-hidden="true" />
            <span>Voltar para o login</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
