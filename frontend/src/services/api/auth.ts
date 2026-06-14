//Types
import {
  LoginData,
  LoginResponse,
  RegisterData,
  RegisterResponse,
} from "@/types/auth";

const API_URL = process.env.API_BASE_URL;

const headers = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

export async function login(formData: LoginData): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_URL}login`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: formData.email,
        password: formData.senha,
      }),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error(`Login error: Expected JSON but got HTTP ${res.status}`);
      return { success: false, message: `Servidor indisponível no momento (${res.status}). Tente novamente em instantes.` };
    }

    if (!res.ok) {  
      // Retorna o body completo para que o loginAction possa inspecionar
      // campos como email_verified: false (HTTP 403) ou outras respostas de erro.
      return data;
    }

    return data;
  } catch (error) {
    console.error("Login fetch error:", error, "API_URL used:", API_URL);
    return {
      success: false,
      message: "Erro inesperado",
    };
  }
}

export async function deleteAccount(
  token: string,
  password: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_URL}me`, {
      method: "DELETE",
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    });

    const data = await res.json().catch(() => ({
      success: false,
      message: `Servidor indisponível (${res.status}).`,
    }));

    return data;
  } catch (error) {
    console.error("Delete account fetch error:", error);
    return { success: false, message: "Erro inesperado" };
  }
}

export async function forgotPassword(
  email: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_URL}password/forgot`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    });

    return await res.json().catch(() => ({
      success: false,
      message: `Servidor indisponível (${res.status}).`,
    }));
  } catch (error) {
    console.error("Forgot password fetch error:", error);
    return { success: false, message: "Erro inesperado" };
  }
}

export async function resetPassword(payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_URL}password/reset`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    return await res.json().catch(() => ({
      success: false,
      message: `Servidor indisponível (${res.status}).`,
    }));
  } catch (error) {
    console.error("Reset password fetch error:", error);
    return { success: false, message: "Erro inesperado" };
  }
}

export async function register(
  formData: RegisterData,
): Promise<RegisterResponse> {
  try {
    const res = await fetch(`${API_URL}register`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: formData.nome,
        email: formData.email,
        password: formData.senha,
        password_confirmation: formData.confirmaSenha,
        avatar_url: "https://example.com/avatar.png",
      }),
    });

    const data = await res.json();

    return data;
  } catch (error) {
    return {
      success: false,
      message: "Erro inesperado",
      errors: {},
    };
  }
}
