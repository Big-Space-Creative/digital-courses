"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdArrowBack, MdLockOutline } from "react-icons/md";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import AuthLayout from "@/components/marketing/AuthLayout";
import { resetPasswordAction } from "@/app/actions/auth";
import { toast } from "@/components/ui/Toast";

const resetSchema = z
  .object({
    password: z.string().min(8, "A senha deve conter pelo menos 8 caracteres"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "As senhas não conferem",
    path: ["password_confirmation"],
  });

type ResetData = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
  });

  const isLinkValid = Boolean(token && email);

  const handleReset = async (data: ResetData) => {
    const res = await resetPasswordAction({
      token,
      email,
      password: data.password,
      password_confirmation: data.password_confirmation,
    });

    if (!res.success) {
      toast("Não foi possível redefinir", {
        description: res.message,
        variant: "error",
      });
      return;
    }

    toast("Senha redefinida com sucesso", {
      description: "Agora você pode fazer login com sua nova senha.",
      variant: "success",
    });

    router.push("/login");
  };

  return (
    <AuthLayout contextType="recovery">
      <div className="flex flex-col gap-2">
        <h1 className="text-text text-3xl font-semibold tracking-tight">
          Criar nova senha
        </h1>
        {isLinkValid ? (
          <p className="text-text-muted text-sm leading-relaxed">
            Defina uma nova senha de acesso para{" "}
            <strong className="text-text font-semibold break-all">
              {email}
            </strong>
            .
          </p>
        ) : (
          <p className="text-text-muted text-sm leading-relaxed">
            Este link de redefinição expirou ou é inválido. Solicite um novo
            link para prosseguir com segurança.
          </p>
        )}
      </div>

      {!isLinkValid ? (
        <div className="mt-6 flex flex-col gap-4">
          <Link
            href="/esqueci-senha"
            className="focus-visible:ring-accent flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#FF6B07] px-6 py-3 text-sm font-semibold text-[var(--on-accent)] shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Solicitar novo link
          </Link>
          <div className="border-t border-[var(--border)] pt-4">
            <Link
              href="/login"
              className="text-text-muted hover:text-text focus-visible:ring-accent flex min-h-[44px] items-center gap-1.5 rounded-sm text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <MdArrowBack size={18} aria-hidden="true" />
              <span>Voltar para o login</span>
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(handleReset)}
          className="mt-6 flex flex-col gap-4"
          noValidate
        >
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            icon={MdLockOutline}
            placeholder="No mínimo 8 caracteres"
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            icon={MdLockOutline}
            placeholder="Repita a nova senha"
            error={errors.password_confirmation?.message}
            {...register("password_confirmation")}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="mt-2 w-full font-semibold"
          >
            {isSubmitting ? "Salvando..." : "Redefinir senha"}
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
      )}
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
