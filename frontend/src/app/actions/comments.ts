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

export type LessonComment = {
  id: number;
  content: string;
  created_at: string | null;
  updated_at: string | null;
  user: {
    id: number;
    name: string;
    role?: string;
    subscription_type?: string | null;
    avatar_url?: string | null;
  } | null;
  admin_reply: null;
  can_admin_reply: boolean;
  lesson?: {
    id: number;
    title: string;
    module?: {
      id: number;
      title: string;
      course?: {
        id: number;
        title: string;
      } | null;
    } | null;
  } | null;
};

export type AdminCommentsPaginated = {
  data: LessonComment[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
};

export async function listLessonCommentsAction(
  lessonId: number,
): Promise<{ success: true; data: LessonComment[] } | { success: false; error: string }> {
  const token = await getToken();
  if (!token) return { success: false, error: "Nao autenticado" };

  try {
    const res = await fetch(`${API_URL}lessons/${lessonId}/comments`, {
      headers: authHeaders(token),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.message ?? `Erro ${res.status}` };
    }

    const json = await res.json();
    return { success: true, data: json.data ?? [] };
  } catch {
    return { success: false, error: "Falha de conexao com o servidor" };
  }
}

export async function createLessonCommentAction(
  lessonId: number,
  content: string,
): Promise<{ success: true; data: LessonComment } | { success: false; error: string }> {
  const token = await getToken();
  if (!token) return { success: false, error: "Nao autenticado" };

  try {
    const res = await fetch(`${API_URL}lessons/${lessonId}/comments`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ content }),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.message ?? `Erro ${res.status}` };
    }

    const json = await res.json();
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Falha de conexao com o servidor" };
  }
}

export async function listAdminCommentsAction(params?: {
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<
  | { success: true; data: AdminCommentsPaginated }
  | { success: false; error: string }
> {
  const token = await getToken();
  if (!token) return { success: false, error: "Nao autenticado" };

  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  qs.set("page", String(params?.page ?? 1));
  qs.set("per_page", String(params?.perPage ?? 15));

  try {
    const res = await fetch(`${API_URL}admin/comments?${qs}`, {
      headers: authHeaders(token),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.message ?? `Erro ${res.status}` };
    }

    const json = await res.json();
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Falha de conexao com o servidor" };
  }
}

export async function deleteAdminCommentAction(
  commentId: number,
): Promise<{ success: boolean; error?: string }> {
  const token = await getToken();
  if (!token) return { success: false, error: "Nao autenticado" };

  try {
    const res = await fetch(`${API_URL}admin/comments/${commentId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.message ?? `Erro ${res.status}` };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Falha de conexao com o servidor" };
  }
}
