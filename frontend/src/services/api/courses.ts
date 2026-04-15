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

export async function apiGetCourse(token: string, courseId: number) {
  const res = await fetch(`${API_URL}courses/${courseId}`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erro ao carregar curso (${res.status})`);
  }

  return res.json();
}

export async function apiUpdateCourse(
  token: string,
  courseId: number,
  payload: {
    title?: string;
    description?: string;
    isPublished?: boolean;
    thumbnailFile?: File | null;
  },
) {
  const form = new FormData();
  form.append("_method", "PUT");

  if (payload.title !== undefined) form.append("title", payload.title);
  if (payload.description !== undefined) form.append("description", payload.description);
  if (payload.isPublished !== undefined) {
    form.append("is_published", payload.isPublished ? "1" : "0");
  }
  if (payload.thumbnailFile) {
    form.append("thumbnail_file", payload.thumbnailFile);
  }

  const res = await fetch(`${API_URL}courses/${courseId}`, {
    method: "POST",
    headers: authHeaders(token),
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erro ao atualizar curso (${res.status})`);
  }

  return res.json();
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
    throw new Error(err?.message ?? `Erro ao criar módulo (${res.status})`);
  }

  return res.json();
}

export async function apiUpdateModule(
  token: string,
  courseId: number,
  moduleId: number,
  payload: {
    title?: string;
    description?: string;
    order?: number;
  },
) {
  const res = await fetch(`${API_URL}courses/${courseId}/modules/${moduleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erro ao atualizar módulo (${res.status})`);
  }

  return res.json();
}

export async function apiDeleteModule(token: string, courseId: number, moduleId: number) {
  const res = await fetch(`${API_URL}courses/${courseId}/modules/${moduleId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erro ao excluir módulo (${res.status})`);
  }
}

export async function apiUploadLesson(
  token: string,
  moduleId: number,
  payload: {
    title: string;
    description?: string;
    durationInMinutes?: number;
    isFreePreview?: boolean;
    videoFile?: File;
    videoPath?: string;
    thumbnailFile?: File;
    materials?: { title: string; file?: File; path?: string }[];
  },
): Promise<LessonUploadedResponse> {
  const form = new FormData();
  form.append("title", payload.title);

  if (payload.description) form.append("description", payload.description);
  if (payload.durationInMinutes) {
    form.append("duration_in_minutes", String(payload.durationInMinutes));
  }

  form.append("is_free_preview", payload.isFreePreview ? "1" : "0");
  
  if (payload.videoFile) form.append("video_file", payload.videoFile);
  if (payload.videoPath) form.append("video_path", payload.videoPath);
  if (payload.thumbnailFile) form.append("thumbnail_file", payload.thumbnailFile);

  if (payload.materials) {
    payload.materials.forEach((mat, i) => {
      if (mat.file) form.append(`materials[${i}]`, mat.file);
      if (mat.path) form.append(`material_paths[${i}]`, mat.path);
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

export async function apiUpdateLesson(
  token: string,
  lessonId: number,
  payload: {
    title?: string;
    description?: string;
    durationInMinutes?: number | null;
    isFreePreview?: boolean;
    videoPath?: string;
    thumbnailFile?: File | null;
  },
) {
  const form = new FormData();
  form.append("_method", "PUT");

  if (payload.title !== undefined) form.append("title", payload.title);
  if (payload.description !== undefined) form.append("description", payload.description);
  if (payload.durationInMinutes !== undefined) {
    form.append(
      "duration_in_minutes",
      payload.durationInMinutes === null ? "" : String(payload.durationInMinutes),
    );
  }
  if (payload.isFreePreview !== undefined) {
    form.append("is_free_preview", payload.isFreePreview ? "1" : "0");
  }
  if (payload.videoPath) form.append("video_path", payload.videoPath);
  if (payload.thumbnailFile) form.append("thumbnail_file", payload.thumbnailFile);

  const res = await fetch(`${API_URL}lessons/${lessonId}`, {
    method: "POST",
    headers: authHeaders(token),
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erro ao atualizar aula (${res.status})`);
  }

  return res.json();
}

export async function apiUploadLessonMaterial(
  token: string,
  lessonId: number,
  payload: {
    title: string;
    file: File;
  },
) {
  const form = new FormData();
  form.append("title", payload.title);
  form.append("file", payload.file);

  const res = await fetch(`${API_URL}lessons/${lessonId}/materials/upload`, {
    method: "POST",
    headers: authHeaders(token),
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erro ao enviar material (${res.status})`);
  }

  return res.json();
}

export async function apiDeleteLesson(token: string, lessonId: number) {
  const res = await fetch(`${API_URL}lessons/${lessonId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Erro ao excluir aula (${res.status})`);
  }
}
