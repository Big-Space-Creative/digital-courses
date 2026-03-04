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

    const data = await res.json();

    if (!res.ok) {
      return {
        message: data.message ?? "Credenciais inválidas",
      };
    }

    return data;
  } catch (error) {
    return {
      message: "Erro inesperado",
    };
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
        role: "student",
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
