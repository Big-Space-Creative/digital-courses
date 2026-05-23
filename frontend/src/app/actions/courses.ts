"use server";

import { cookies } from "next/headers";
const API_URL = process.env.API_BASE_URL;

async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("access_token")?.value ?? null;
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export type ApiLesson = {
  id: number;
  module_id: number;
  title: string;
  description: string | null;
  thumbnail?: string | null;
  duration_in_minutes: number | null;
  is_free_preview: boolean;
  video_url?: string;
};

export type ApiMaterial = {
  id: number;
  title: string;
  file_path: string;
  type: string;
};

export type ApiComment = {
  id: number;
  content: string;
  created_at?: string | null;
  user?: {
    id: number;
    name: string;
  } | null;
};

export type ApiModule = {
  id: number;
  course_id: number;
  title: string;
  description?: string | null;
  order: number;
  lessons: ApiLesson[];
};

export type ApiCourse = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  price: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  modules?: ApiModule[];
  lessons_count?: number;
  enrollments_count?: number;
};

export type ApiLessonDetail = ApiLesson & {
  video_url: string | null;
  materials: ApiMaterial[];
  comments: ApiComment[];
  module: ApiModule & {
    course: ApiCourse & {
      modules: ApiModule[];
    };
  };
};

export type CoursesPaginated = {
  data: ApiCourse[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
};

export async function listCoursesAction(params?: {
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<
  | { success: true; data: CoursesPaginated }
  | { success: false; error: string }
> {
  const token = await getToken();
  if (!token) return { success: false, error: "Nao autenticado" };

  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  qs.set("page", String(params?.page ?? 1));
  qs.set("per_page", String(params?.perPage ?? 20));

  try {
    const res = await fetch(`${API_URL}admin/courses?${qs}`, {
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

export async function getCourseDetailAction(courseId: number): Promise<
  | { success: true; data: ApiCourse & { modules: ApiModule[] } }
  | { success: false; error: string }
> {
  const token = await getToken();
  if (!token) return { success: false, error: "Nao autenticado" };

  try {
    const res = await fetch(`${API_URL}courses/${courseId}`, {
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

export async function getFirstPublishedCourseAction(): Promise<
  | { success: true; data: ApiCourse & { modules: ApiModule[] } }
  | { success: false; error: string }
> {
  const token = await getToken();
  if (!token) return { success: false, error: "Nao autenticado" };

  try {
    const res = await fetch(`${API_URL}courses`, {
      headers: authHeaders(token),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.message ?? `Erro ${res.status}` };
    }

    const json = await res.json();
    const courses: ApiCourse[] = json.data ?? [];
    const publishedCourse = courses.find((course) => course.is_published);

    if (!publishedCourse) {
      return { success: false, error: "Nenhum curso publicado disponivel ainda." };
    }

    return getCourseDetailAction(publishedCourse.id);
  } catch {
    return { success: false, error: "Falha de conexao com o servidor" };
  }
}

export async function getLessonDetailAction(lessonId: number): Promise<
  | { success: true; data: ApiLessonDetail }
  | { success: false; error: string }
> {
  const token = await getToken();
  if (!token) return { success: false, error: "Nao autenticado" };

  try {
    const res = await fetch(`${API_URL}lessons/${lessonId}`, {
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

export async function getFeaturedCourseAction(): Promise<
  | { success: true; data: ApiCourse & { modules: ApiModule[] } }
  | { success: false; error: string }
> {
  return getFirstPublishedCourseAction();
}

export async function deleteCourseAction(
  courseId: number,
): Promise<{ success: boolean; error?: string }> {
  const token = await getToken();
  if (!token) return { success: false, error: "Nao autenticado" };

  try {
    const res = await fetch(`${API_URL}courses/${courseId}`, {
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

export async function togglePublishCourseAction(
  courseId: number,
  publish: boolean,
): Promise<{ success: boolean; error?: string }> {
  const token = await getToken();
  if (!token) return { success: false, error: "Nao autenticado" };

  try {
    const res = await fetch(`${API_URL}courses/${courseId}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ is_published: publish }),
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

// ─── Métricas do Dashboard ─────────────────────────────────────────────────────

export type DashboardStats = {
  users: {
    total: number;
    students: number;
    instructors: number;
    admins: number;
    premium: number;
    free: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
  };
  enrollments: {
    total: number;
    active: number;
  };
  lessons: {
    active: number;
  };
};

export async function getDashboardStatsAction(): Promise<
  | { success: true; data: DashboardStats }
  | { success: false; error: string }
> {
  const token = await getToken();
  if (!token) return { success: false, error: "Não autenticado" };

  try {
    const res = await fetch(`${API_URL}admin/dashboard`, {
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
    return { success: false, error: "Falha de conexão com o servidor" };
  }
}
