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
