import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  apiCreateCourse,
  apiCreateModule,
  apiUploadLesson,
} from "@/services/api/courses";

type LessonInput = {
  id: string;
  title: string;
  description: string;
  durationMinutes: string;
  isFreePreview: boolean;
};

type ModuleInput = {
  id: string;
  name: string;
  lessons: LessonInput[];
};

function isFileLike(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "size" in value &&
    "name" in value
  );
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Nao autenticado", step: "auth" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const courseTitle = (formData.get("courseTitle") as string | null)?.trim();
    const courseDescription =
      (formData.get("courseDescription") as string | null)?.trim() || undefined;
    const thumbnailFile = formData.get("thumbnailFile");
    const isPublished = formData.get("isPublished") === "1";
    const modulesJson = formData.get("modules") as string | null;

    if (!courseTitle) {
      return NextResponse.json(
        {
          success: false,
          error: "Titulo do curso e obrigatorio",
          step: "validate",
        },
        { status: 400 },
      );
    }

    let modules: ModuleInput[] = [];
    try {
      modules = modulesJson ? JSON.parse(modulesJson) : [];
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Estrutura de modulos invalida",
          step: "validate",
        },
        { status: 400 },
      );
    }

    let courseId: number;
    try {
      const courseRes = await apiCreateCourse(token, {
        title: courseTitle,
        description: courseDescription,
        isPublished,
        thumbnailFile: isFileLike(thumbnailFile) ? thumbnailFile : null,
      });
      const createdCourseId =
        typeof courseRes?.data?.id === "number"
          ? courseRes.data.id
          : typeof (courseRes as any)?.id === "number"
            ? ((courseRes as any).id)
            : null;

      if (!createdCourseId) {
        return NextResponse.json(
          {
            success: false,
            error: "Resposta invalida ao criar curso",
            step: "create-course",
            details: courseRes,
          },
          { status: 500 },
        );
      }

      courseId = createdCourseId;
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao criar curso",
          step: "create-course",
        },
        { status: 500 },
      );
    }

    for (let modIndex = 0; modIndex < modules.length; modIndex++) {
      const mod = modules[modIndex]!;
      let moduleId: number;

      try {
        const modRes = await apiCreateModule(token, courseId, mod.name, modIndex);
        moduleId = modRes.data.id;
      } catch (err) {
        return NextResponse.json(
          {
            success: false,
            error:
              err instanceof Error
                ? err.message
                : `Erro ao criar modulo "${mod.name}"`,
            step: "create-module",
          },
          { status: 500 },
        );
      }

      for (const lesson of mod.lessons) {
        const videoFile = formData.get(`video_${lesson.id}`);
        const videoPath = formData.get(`video_path_${lesson.id}`) as string | null;

        if ((!isFileLike(videoFile) || videoFile.size === 0) && !videoPath) {
          return NextResponse.json(
            {
              success: false,
              error: `A aula "${lesson.title}" nao tem video`,
              step: "validate-lesson",
            },
            { status: 400 },
          );
        }

        const materials: { title: string; file?: File; path?: string }[] = [];
        const matPrefix = `mat_file_${lesson.id}_`;
        const matPathPrefix = `mat_path_${lesson.id}_`;

        for (const [key, value] of formData.entries()) {
          const isFile = key.startsWith(matPrefix) && isFileLike(value) && value.size > 0;
          const isPath = key.startsWith(matPathPrefix) && typeof value === 'string' && value.length > 0;
          
          if (isFile || isPath) {
            const matId = key.replace(isFile ? matPrefix : matPathPrefix, "");
            const matTitle = (formData.get(`mat_title_${lesson.id}_${matId}`) as string | null) ?? "Material";
            
            if (isFile) {
                materials.push({ title: matTitle, file: value });
            } else if (isPath) {
                materials.push({ title: matTitle, path: value });
            }
          }
        }

        try {
          await apiUploadLesson(token, moduleId, {
            title: lesson.title,
            description: lesson.description || undefined,
            durationInMinutes: lesson.durationMinutes
              ? parseInt(lesson.durationMinutes, 10)
              : undefined,
            isFreePreview: lesson.isFreePreview,
            videoFile: isFileLike(videoFile) ? videoFile : undefined,
            videoPath: videoPath || undefined,
            materials: materials.length > 0 ? materials : undefined,
          });
        } catch (err) {
          return NextResponse.json(
            {
              success: false,
              error:
                err instanceof Error
                  ? err.message
                  : `Erro ao enviar aula "${lesson.title}"`,
              step: "upload-lesson",
            },
            { status: 500 },
          );
        }
      }
    }

    return NextResponse.json({ success: true, courseId });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Erro inesperado ao processar a criacao do curso",
        step: "unexpected",
      },
      { status: 500 },
    );
  }
}
