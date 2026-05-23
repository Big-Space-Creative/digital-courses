import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  apiUpdateCourse,
  apiCreateModule,
  apiUpdateModule,
  apiDeleteModule,
  apiUploadLesson,
  apiUpdateLesson,
  apiDeleteLesson,
  apiUploadLessonMaterial,
  apiDeleteMaterial,
} from "@/services/api/courses";

type LessonInput = {
  id: string | number;
  title: string;
  description: string;
  durationMinutes: string;
  isFreePreview: boolean;
};

type ModuleInput = {
  id: string | number;
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId: courseIdStr } = await params;
    const courseId = parseInt(courseIdStr, 10);
    
    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, error: "ID de curso inválido" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Não autenticado", step: "auth" },
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
    const deletedModulesJson = formData.get("deletedModules") as string | null;
    const deletedLessonsJson = formData.get("deletedLessons") as string | null;
    const deletedMaterialsJson = formData.get("deletedMaterials") as string | null;

    if (!courseTitle) {
      return NextResponse.json(
        { success: false, error: "Título do curso é obrigatório", step: "validate" },
        { status: 400 },
      );
    }

    let modules: ModuleInput[] = [];
    let deletedModules: number[] = [];
    let deletedLessons: number[] = [];
    let deletedMaterials: number[] = [];

    try {
      modules = modulesJson ? JSON.parse(modulesJson) : [];
      deletedModules = deletedModulesJson ? JSON.parse(deletedModulesJson) : [];
      deletedLessons = deletedLessonsJson ? JSON.parse(deletedLessonsJson) : [];
      deletedMaterials = deletedMaterialsJson ? JSON.parse(deletedMaterialsJson) : [];
    } catch {
      return NextResponse.json(
        { success: false, error: "Estrutura JSON inválida", step: "validate" },
        { status: 400 },
      );
    }

    // 1. Delete items that were removed
    for (const matId of deletedMaterials) {
      try { await apiDeleteMaterial(token, matId); } catch (err) { console.error("Error deleting material", err); }
    }
    for (const lessonId of deletedLessons) {
      try { await apiDeleteLesson(token, lessonId); } catch (err) { console.error("Error deleting lesson", err); }
    }
    for (const moduleId of deletedModules) {
      try { await apiDeleteModule(token, courseId, moduleId); } catch (err) { console.error("Error deleting module", err); }
    }

    // 2. Update Course Info
    try {
      await apiUpdateCourse(token, courseId, {
        title: courseTitle,
        description: courseDescription,
        isPublished,
        thumbnailFile: isFileLike(thumbnailFile) ? thumbnailFile : null,
      });
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err instanceof Error ? err.message : "Erro ao atualizar curso", step: "update-course" },
        { status: 500 },
      );
    }

    // 3. Process Modules and Lessons
    for (let modIndex = 0; modIndex < modules.length; modIndex++) {
      const mod = modules[modIndex]!;
      let moduleId: number;

      try {
        if (typeof mod.id === "number") {
          // Update existing module
          await apiUpdateModule(token, courseId, mod.id, {
            title: mod.name,
            order: modIndex,
          });
          moduleId = mod.id;
        } else {
          // Create new module
          const modRes = await apiCreateModule(token, courseId, mod.name, modIndex);
          moduleId = modRes.data.id;
        }
      } catch (err) {
        return NextResponse.json(
          { success: false, error: err instanceof Error ? err.message : `Erro ao salvar módulo "${mod.name}"`, step: "save-module" },
          { status: 500 },
        );
      }

      for (const lesson of mod.lessons) {
        const videoFile = formData.get(`video_${lesson.id}`);
        const videoPath = formData.get(`video_path_${lesson.id}`) as string | null;

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
          if (typeof lesson.id === "number") {
            // Update existing lesson
            await apiUpdateLesson(token, lesson.id, {
              title: lesson.title,
              description: lesson.description || undefined,
              durationInMinutes: lesson.durationMinutes ? parseInt(lesson.durationMinutes, 10) : null,
              isFreePreview: lesson.isFreePreview,
              videoPath: videoPath || undefined,
              // If videoFile was provided directly here, we'd need another endpoint, but we use direct minIO upload so we only send videoPath
            });

            // For existing lessons, we just upload the NEW materials, because old materials are already preserved on the backend unless deleted.
            // Wait, materials that have `file` are new. Materials with `path` are existing.
            // So we only upload new materials.
            const newMaterials = materials.filter(m => m.file);
            for (const mat of newMaterials) {
              if (mat.file) {
                await apiUploadLessonMaterial(token, lesson.id, { title: mat.title, file: mat.file });
              }
            }
          } else {
            // Create new lesson
            if ((!isFileLike(videoFile) || videoFile.size === 0) && !videoPath) {
              return NextResponse.json(
                { success: false, error: `A aula "${lesson.title}" não tem vídeo`, step: "validate-lesson" },
                { status: 400 }
              );
            }

            await apiUploadLesson(token, moduleId, {
              title: lesson.title,
              description: lesson.description || undefined,
              durationInMinutes: lesson.durationMinutes ? parseInt(lesson.durationMinutes, 10) : undefined,
              isFreePreview: lesson.isFreePreview,
              videoFile: isFileLike(videoFile) ? videoFile : undefined,
              videoPath: videoPath || undefined,
              materials: materials.length > 0 ? materials : undefined,
            });
          }
        } catch (err) {
          return NextResponse.json(
            { success: false, error: err instanceof Error ? err.message : `Erro ao salvar aula "${lesson.title}"`, step: "save-lesson" },
            { status: 500 },
          );
        }
      }
    }

    return NextResponse.json({ success: true, courseId });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Erro inesperado", step: "unexpected" },
      { status: 500 },
    );
  }
}
