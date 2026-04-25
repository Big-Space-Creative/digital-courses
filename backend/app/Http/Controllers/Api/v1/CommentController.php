<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function indexByLesson(Request $request, int $lesson_id): JsonResponse
    {
        $lesson = Lesson::findOrFail($lesson_id);
        $user = $request->user();

        if (! $this->canAccessLesson($lesson, $user?->role, $user?->subscription_type)) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado a esta aula.',
            ], 403);
        }

        $comments = Comment::query()
            ->where('lesson_id', $lesson->id)
            ->with('user:id,name,role,subscription_type,avatar_url')
            ->latest('created_at')
            ->get()
            ->map(fn (Comment $comment) => $this->toCommentPayload($comment));

        return response()->json([
            'success' => true,
            'message' => 'Comentários carregados com sucesso',
            'data' => $comments,
        ]);
    }

    public function store(Request $request, int $lesson_id): JsonResponse
    {
        $lesson = Lesson::findOrFail($lesson_id);
        $user = $request->user();

        if (! $this->canAccessLesson($lesson, $user?->role, $user?->subscription_type)) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado a esta aula.',
            ], 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'min:1', 'max:2000'],
        ], [
            'content.required' => 'O comentário não pode estar vazio.',
            'content.max' => 'O comentário deve ter no máximo 2000 caracteres.',
        ]);

        $comment = Comment::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'content' => trim($validated['content']),
        ]);

        $comment->load('user:id,name,role,subscription_type,avatar_url');

        return response()->json([
            'success' => true,
            'message' => 'Comentário criado com sucesso',
            'data' => $this->toCommentPayload($comment),
        ], 201);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $query = Comment::query()
            ->with([
                'user:id,name,role,subscription_type,avatar_url',
                'lesson:id,module_id,title',
                'lesson.module:id,course_id,title',
                'lesson.module.course:id,title',
            ]);

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($u) use ($search) {
                        $u->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('lesson', function ($l) use ($search) {
                        $l->where('title', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = (int) $request->get('per_page', 20);
        $perPage = max(5, min($perPage, 100));

        $comments = $query->latest('created_at')->paginate($perPage);

        $comments->getCollection()->transform(function (Comment $comment) {
            return $this->toCommentPayload($comment, includeLessonContext: true);
        });

        return response()->json([
            'success' => true,
            'message' => 'Comentários listados com sucesso',
            'data' => $comments,
        ]);
    }

    public function destroy(int $comment): JsonResponse
    {
        $commentModel = Comment::findOrFail($comment);
        $commentModel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comentário removido com sucesso',
        ]);
    }

    private function canAccessLesson(Lesson $lesson, ?string $role, ?string $subscriptionType): bool
    {
        $hasFullAccess = in_array($role, ['admin', 'instructor'], true);

        if ($hasFullAccess) {
            return true;
        }

        if ($lesson->is_free_preview) {
            return true;
        }

        return $subscriptionType === 'premium';
    }

    private function toCommentPayload(Comment $comment, bool $includeLessonContext = false): array
    {
        $lesson = $comment->lesson;
        $module = $lesson?->module;
        $course = $module?->course;

        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'created_at' => optional($comment->created_at)?->toISOString(),
            'updated_at' => optional($comment->updated_at)?->toISOString(),
            'user' => $comment->user ? [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'role' => $comment->user->role,
                'subscription_type' => $comment->user->subscription_type,
                'avatar_url' => $comment->user->avatar_url,
            ] : null,
            // Estrutura reservada para implementação futura de replies por comentário.
            'admin_reply' => null,
            'can_admin_reply' => true,
            'lesson' => $includeLessonContext && $lesson ? [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'module' => $module ? [
                    'id' => $module->id,
                    'title' => $module->title,
                    'course' => $course ? [
                        'id' => $course->id,
                        'title' => $course->title,
                    ] : null,
                ] : null,
            ] : null,
        ];
    }
}
