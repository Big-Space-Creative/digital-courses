import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  apiCreateModule,
  apiDeleteLesson,
  apiDeleteModule,
  apiGetCourse,
  apiUpdateCourse,
  apiUpdateLesson,
  apiUpdateModule,
  apiUploadLesson,
  apiUploadLessonMaterial,
} from "@/services/api/courses";

type MaterialInput = {
  id: string;
  dbId?: number;
  title: string;
  path?: string | null;
};

type LessonInput = {
  id: string;
  dbId?: number;
  title: string;
  description: string;
  durationMinutes: string;
  isFreePreview: boolean;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  materials: MaterialInput[];
};

type ModuleInput = {
  id: string;
  dbId?: number;
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

function parseJsonArray(value: FormDataEntryValue | null): number[] {
  if (typeof value !== "string" || !value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is number => typeof item === "number")
      : [];
  } catch {
    return [];
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Nao autenticado" }, { status: 401 });
    }

    const { courseId } = await context.params;
    const result = await apiGetCourse(token, Number(courseId));

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao carregar curso",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Nao autenticado", step: "auth" },
        { status: 401 },
      );
    }

    const { courseId } = await context.params;
    const parsedCourseId = Number(courseId);
    const formData = await request.formData();

    const courseTitle = (formData.get("courseTitle") as string | null)?.trim();
    const courseDescription =
      (formData.get("courseDescription") as string | null)?.trim() ?? "";
    const thumbnailFile = formData.get("thumbnailFile");
    const isPublished = formData.get("isPublished") === "1";
    const modulesJson = formData.get("modules");
    const removedModuleIds = parseJsonArray(formData.get("removedModuleIds"));
    const removedLessonIds = parseJsonArray(formData.get("removedLessonIds"));

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
      modules = typeof modulesJson === "string" ? JSON.parse(modulesJson) : [];
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

    await apiUpdateCourse(token, parsedCourseId, {
      title: courseTitle,
      description: courseDescription,
      isPublished,
      thumbnailFile: isFileLike(thumbnailFile) ? thumbnailFile : null,
    });

    for (const lessonId of removedLessonIds) {
      await apiDeleteLesson(token, lessonId);
    }

    for (const moduleId of removedModuleIds) {
      await apiDeleteModule(token, parsedCourseId, moduleId);
    }

    for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
      const moduleItem = modules[moduleIndex];
      if (!moduleItem) continue;

      const moduleName = moduleItem.name.trim();
      if (!moduleName) {
        return NextResponse.json(
          {
            success: false,
            error: "Todo modulo precisa ter um titulo",
            step: "validate-module",
          },
          { status: 400 },
        );
      }

      let moduleId = moduleItem.dbId;
      if (moduleId) {
        await apiUpdateModule(token, parsedCourseId, moduleId, {
          title: moduleName,
          order: moduleIndex,
        });
      } else {
        const createdModule = await apiCreateModule(token, parsedCourseId, moduleName, moduleIndex);
        moduleId = createdModule.data.id;
      }

      for (const lesson of moduleItem.lessons) {
        const title = lesson.title.trim();
        if (!title) {
          return NextResponse.json(
            {
              success: false,
              error: "Toda aula precisa ter um titulo",
              step: "validate-lesson",
            },
            { status: 400 },
          );
        }

        const videoPath = formData.get(`video_path_${lesson.id}`);
        const thumbnailEntry = formData.get(`lesson_thumbnail_${lesson.id}`);
        const thumbnailFileValue = isFileLike(thumbnailEntry) ? thumbnailEntry : null;
        const newMaterials = lesson.materials
          .filter((material) => !material.dbId)
          .map((material) => {
            const materialEntry = formData.get(`lesson_material_${lesson.id}_${material.id}`);

            return {
              title: material.title.trim() || "Material",
              file: isFileLike(materialEntry) ? materialEntry : null,
            };
          })
          .filter((material) => material.file);

        if (!lesson.dbId && !lesson.videoUrl && typeof videoPath !== "string") {
          return NextResponse.json(
            {
              success: false,
              error: `A aula "${title}" precisa de um video`,
              step: "validate-lesson-video",
            },
            { status: 400 },
          );
        }

        if (lesson.dbId) {
          await apiUpdateLesson(token, lesson.dbId, {
            title,
            description: lesson.description,
            durationInMinutes: lesson.durationMinutes
              ? parseInt(lesson.durationMinutes, 10)
              : null,
            isFreePreview: lesson.isFreePreview,
            videoPath: typeof videoPath === "string" ? videoPath : undefined,
            thumbnailFile: thumbnailFileValue,
          });

          for (const material of newMaterials) {
            await apiUploadLessonMaterial(token, lesson.dbId, {
              title: material.title,
              file: material.file,
            });
          }
        } else if (moduleId) {
          await apiUploadLesson(token, moduleId, {
            title,
            description: lesson.description || undefined,
            durationInMinutes: lesson.durationMinutes
              ? parseInt(lesson.durationMinutes, 10)
              : undefined,
            isFreePreview: lesson.isFreePreview,
            videoPath: typeof videoPath === "string" ? videoPath : undefined,
            thumbnailFile: thumbnailFileValue ?? undefined,
            materials: newMaterials.map((material) => ({
              title: material.title,
              file: material.file,
            })),
          });
        }
      }
    }

    return NextResponse.json({ success: true, courseId: parsedCourseId });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao salvar edicao do curso",
        step: "unexpected",
      },
      { status: 500 },
    );
  }
}
