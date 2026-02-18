"use server";
import { cookies } from "next/headers";

//Services
import { login, register } from "@/services/api/auth";

//Types
import { LoginData, RegisterData } from "@/types/auth";

export async function loginAction(formData: LoginData) {
  const res = await login(formData);
  console.log("Resposta do login:", res);

  if (!("token" in res)) {
    return { error: res.message || "Falha ao autenticar" };
  }

  const cookieStore = await cookies();

  cookieStore.set("auth_Token", res.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: "/",
  });

  return { message: res.message, user: res.user };
}

export async function registerAction(formData: RegisterData) {
  const res = await register(formData);

  if (!res.success) {
    const firstFieldError = Object.values(res.errors)[0]?.[0] ?? null;

    const errorMessage =
      firstFieldError || res.message || "Falha ao cadastrar.";

    console.error("Erro no registro:", errorMessage);

    return {
      error: errorMessage,
      details: res.errors,
    };
  }

  return { success: res.success, message: res.message, user: res.data.user };
}
