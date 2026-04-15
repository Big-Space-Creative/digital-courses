// ─── Tipos do domínio de Cursos ─────────────────────────────────────────────

export type CourseCreatedResponse = {
  data: {
    id: number;
    title: string;
    description: string | null;
  };
  message: string;
};

export type ModuleCreatedResponse = {
  data: {
    id: number;
    title: string;
    course_id: number;
  };
  message: string;
};

export type LessonUploadedResponse = {
  data: {
    id: number;
    title: string;
    thumbnail?: string | null;
    video_url: string;
    materials: { id: number; file_path: string }[];
  };
  message: string;
};

// ─── Estado do formulário de criação/edição ──────────────────────────────────

export type MaterialState = {
  id: string;
  dbId?: number;
  title: string;
  file: File | null;
  path?: string | null;
  type?: string | null;
};

export type LessonState = {
  id: string;
  dbId?: number;
  title: string;
  description: string;
  durationMinutes: string;
  isFreePreview: boolean;
  videoFile: File | null;
  videoUrl?: string | null;
  thumbnailFile?: File | null;
  thumbnailUrl?: string | null;
  materials: MaterialState[];
};

export type ModuleState = {
  id: string;
  dbId?: number;
  name: string;
  lessons: LessonState[];
};

export type CourseFormState = {
  title: string;
  description: string;
  isPublished: boolean;
  thumbnailFile: File | null;
};
