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
    video_url: string;
    materials: { id: number; file_path: string }[];
  };
  message: string;
};

// ─── Estado do formulário de criação/edição ──────────────────────────────────

export type MaterialState = {
  id: string;
  title: string;
  file: File;
};

export type LessonState = {
  id: string;
  title: string;
  description: string;
  durationMinutes: string;
  isFreePreview: boolean;
  videoFile: File | null;
  materials: MaterialState[];
};

export type ModuleState = {
  id: string;
  name: string;
  lessons: LessonState[];
};

export type CourseFormState = {
  title: string;
  description: string;
  isPublished: boolean;
  thumbnailFile: File | null;
};
