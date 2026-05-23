"use server";
import { cookies } from "next/headers";

//Services
import { login, register } from "@/services/api/auth";

//Types
import { LoginData, RegisterData } from "@/types/auth";

export async function loginAction(formData: LoginData) {
  const res = await login(formData);

  // O backend retorna HTTP 403 com { success: false, email_verified: false, message: "..." }
  // quando o usuário ainda não verificou o e-mail.
  // Usamos uma type assertion segura para inspecionar o payload bruto.
  const raw = res as Record<string, unknown>;
  if (raw.email_verified === false) {
    return {
      error: (raw.message as string) || "E-mail não verificado.",
      email_not_verified: true,
    };
  }

  if (!("data" in res)) {
    return { error: (raw.message as string) || "Falha ao autenticar" };
  }

  if (!("access_token" in res.data) || !("refresh_token" in res.data)) {
    return { error: res.message || "Falha ao autenticar" };
  }

  const cookieStore = await cookies();

  cookieStore.set("access_token", res.data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });

  cookieStore.set("refresh_token", res.data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  // Cookie de role — NÃO httpOnly para que o proxy/middleware consiga lê-lo.
  // Não contém dados sensíveis, apenas a role do usuário.
  cookieStore.set("user_role", res.data.user.role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return {
    message: res.message,
    user: {
      name: res.data.user.name,
      email: res.data.user.email,
      role: res.data.user.role,
      subscriptionType: res.data.user.subscription_type?.trim() || undefined,
      urlPhoto: res.data.user.avatar_url,
    },
  };
}

export async function registerAction(formData: RegisterData) {
  const res = await register(formData);

  if (!res.success) {
    // res.errors pode ser undefined quando o backend retorna um erro genérico
    // (não de validação). Object.values(undefined) lança TypeError — por isso o guard.
    const firstFieldError =
      res.errors && Object.keys(res.errors).length > 0
        ? (Object.values(res.errors)[0] as string[])?.[0] ?? null
        : null;

    const errorMessage =
      firstFieldError || res.message || "Falha ao cadastrar.";

    console.error("Erro no registro:", errorMessage);

    return {
      error: errorMessage,
      details: res.errors,
    };
  }

  return { success: res.success, message: res.message, user: res.data?.user };
}

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("user_role");

  return { message: "Saiu da conta com sucesso" };
}

export async function getAccessTokenAction(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value ?? null;
}
