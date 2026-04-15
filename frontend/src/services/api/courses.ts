import type {
  CourseCreatedResponse,
  LessonUploadedResponse,
  ModuleCreatedResponse,
} from "@/types/course";

const API_URL = process.env.API_BASE_URL;

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function apiCreateCourse(
  token: string,
  payload: {
    title: string;
    description?: string;
    isPublished?: boolean;
    thumbnailFile?: File | null;
  },
): Promise<CourseCreatedResponse> {
  const form = new FormData();
  form.append("title", payload.title);
  form.append("is_published", payload.isPublished ? "1" : "0");

  if (payload.description) {
    form.append("description", payload.description);
  }

  if (payload.thumbnailFile) {
    form.append("thumbnail_file", payload.thumbnailFile);
  }

  const res = await fetch(`${API_URL}courses`, {
    method: "POST",
    headers: authHeaders(token),
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erro ao criar curso (${res.status})`);
  }

  const json = await res.json().catch(() => null);

  if (!json || typeof json !== "object") {
    throw new Error("Resposta invalida ao criar curso");
  }

  return json as CourseCreatedResponse;
}

export async function apiCreateModule(
  token: string,
  courseId: number,
  name: string,
  order: number,
): Promise<ModuleCreatedResponse> {
  const res = await fetch(`${API_URL}courses/${courseId}/modules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ title: name, order }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erro ao criar mÃ³dulo (${res.status})`);
  }

  return res.json();
}

export async function apiUploadLesson(
  token: string,
  moduleId: number,
  payload: {
    title: string;
    description?: string;
    durationInMinutes?: number;
    isFreePreview?: boolean;
    videoFile: File;
    materials?: { title: string; file: File }[];
  },
): Promise<LessonUploadedResponse> {
  const form = new FormData();
  form.append("title", payload.title);

  if (payload.description) form.append("description", payload.description);
  if (payload.durationInMinutes) {
    form.append("duration_in_minutes", String(payload.durationInMinutes));
  }

  form.append("is_free_preview", payload.isFreePreview ? "1" : "0");
  form.append("video_file", payload.videoFile);

  if (payload.materials) {
    payload.materials.forEach((mat, i) => {
      form.append(`materials[${i}]`, mat.file);
      form.append(`material_titles[${i}]`, mat.title);
    });
  }

  const res = await fetch(`${API_URL}modules/${moduleId}/lessons/upload`, {
    method: "POST",
    headers: authHeaders(token),
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erro ao enviar aula (${res.status})`);
  }

  return res.json();
}
