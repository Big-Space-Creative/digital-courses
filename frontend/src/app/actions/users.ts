"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_BASE_URL;

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("access_token")?.value ?? null;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type UserRole = "student" | "instructor" | "admin";
export type SubscriptionType = "free" | "premium";

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  subscription_type: SubscriptionType | null;
  avatar_url: string | null;
  created_at: string;
};

export type UsersPaginated = {
  data: ApiUser[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
};

// ─── Listagem de usuários ─────────────────────────────────────────────────────

export async function listUsersAction(params: {
  search?: string;
  role?: UserRole | "";
  page?: number;
  perPage?: number;
}): Promise<
  | { success: true; data: UsersPaginated }
  | { success: false; error: string }
> {
  const token = await getToken();
  if (!token) return { success: false, error: "Não autenticado" };

  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.role)   qs.set("role", params.role);
  qs.set("page",     String(params.page ?? 1));
  qs.set("per_page", String(params.perPage ?? 15));

  try {
    const res = await fetch(`${API_URL}admin/users?${qs}`, {
      headers: authHeaders(token),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.message ?? `Erro ${res.status}` };
    }

    const json = await res.json();
    return { success: true, data: json.data };
  } catch (e) {
    return { success: false, error: "Falha de conexão com o servidor" };
  }
}

// ─── Alterar role ─────────────────────────────────────────────────────────────

export async function updateUserRoleAction(
  userId: number,
  role: UserRole,
): Promise<{ success: boolean; error?: string }> {
  const token = await getToken();
  if (!token) return { success: false, error: "Não autenticado" };

  try {
    const res = await fetch(`${API_URL}admin/users/${userId}/role`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ role }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.message ?? `Erro ${res.status}` };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Falha de conexão com o servidor" };
  }
}

// ─── Alterar plano ────────────────────────────────────────────────────────────

export async function updateUserSubscriptionAction(
  userId: number,
  subscriptionType: SubscriptionType,
): Promise<{ success: boolean; error?: string }> {
  const token = await getToken();
  if (!token) return { success: false, error: "Não autenticado" };

  try {
    const res = await fetch(`${API_URL}admin/users/${userId}/subscription`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ subscription_type: subscriptionType }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.message ?? `Erro ${res.status}` };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Falha de conexão com o servidor" };
  }
}
