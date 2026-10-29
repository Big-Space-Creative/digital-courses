"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdLockOutline } from "react-icons/md";

//Components
import { Input } from "@/components/form/Input";
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

    toast("Senha redefinida", {
      description: "Faça login com a sua nova senha.",
      variant: "success",
    });

    router.push("/login");
  };

  return (
    <AuthLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-ink text-3xl font-semibold tracking-[-0.01em]">
          Criar nova senha
        </h1>
        {isLinkValid ? (
          <p className="text-ink/60 text-sm leading-relaxed">
            Defina uma nova senha para{" "}
            <strong className="text-ink font-semibold break-all">
              {email}
            </strong>
            .
          </p>
        ) : (
          <p className="text-ink/60 text-sm leading-relaxed">
            Este link de redefinição é inválido ou está incompleto. Solicite um
            novo link para continuar.
          </p>
        )}
      </div>

      {!isLinkValid ? (
        <Link
          href="/esqueci-senha"
          className="gradient-animate focus-visible:ring-accent flex h-14 w-full items-center justify-center rounded-full text-sm font-medium text-white shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
          style={{ backgroundImage: "var(--gradient-pulse)" }}
        >
          Solicitar novo link
        </Link>
      ) : (
        <form
          onSubmit={handleSubmit(handleReset)}
          className="flex flex-col gap-5"
        >
          <Input
            label="Nova senha"
            type="password"
            icon={MdLockOutline}
            placeholder="******"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            icon={MdLockOutline}
            placeholder="******"
            error={errors.password_confirmation?.message}
            {...register("password_confirmation")}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="gradient-animate focus-visible:ring-accent flex h-14 w-full items-center justify-center rounded-full text-sm font-medium text-white shadow-lg transition-transform duration-150 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
            style={{ backgroundImage: "var(--gradient-pulse)" }}
          >
            {isSubmitting ? "Salvando..." : "Redefinir senha"}
          </button>
          <Link
            href="/login"
            className="text-accent hover:text-ink mt-2 self-start text-sm font-medium transition-colors"
          >
            Voltar para o login
          </Link>
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
