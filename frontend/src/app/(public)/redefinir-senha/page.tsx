"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdLockOutline, MdMusicNote } from "react-icons/md";

//Components
import { Input } from "@/components/form/Input";
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
    <div className="flex min-h-dvh items-center justify-center px-5">
      <div className="flex w-full flex-col gap-5 md:w-md">
        <div className="flex items-center">
          <MdMusicNote className="text-primary size-6" />
          <h1 className="text-xl font-bold">AulasViolão</h1>
        </div>
        <h1 className="text-secondary text-3xl font-bold">Criar nova senha</h1>

        {!isLinkValid ? (
          <>
            <p className="text-base font-normal text-gray-500">
              Este link de redefinição é inválido ou está incompleto. Solicite um
              novo link para continuar.
            </p>
            <Link
              href="/esqueci-senha"
              className="bg-primary hover:bg-primary-dark rounded-lg py-5 text-center text-sm font-semibold text-white transition-colors duration-300"
            >
              Solicitar novo link
            </Link>
          </>
        ) : (
          <>
            <p className="text-base font-normal text-gray-500">
              Defina uma nova senha para <strong>{email}</strong>.
            </p>
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
                className="bg-primary hover:bg-primary-dark active:bg-primary-dark rounded-lg py-5 text-sm font-semibold text-white transition-colors duration-300 disabled:opacity-60"
              >
                {isSubmitting ? "Salvando..." : "Redefinir senha"}
              </button>
              <p className="mt-2 text-sm">
                <Link
                  href="/login"
                  className="text-primary hover:text-primary-dark active:text-primary-dark"
                >
                  Voltar para o login
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
