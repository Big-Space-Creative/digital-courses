"use client";

import { useMemo, useState, useTransition } from "react";
import {
  MdFolder,
  MdImage,
  MdInsertDriveFile,
  MdMusicNote,
  MdOutlineFileDownload,
  MdPictureAsPdf,
  MdSend,
  MdVideocam,
} from "react-icons/md";
import { createLessonCommentAction } from "@/app/actions/comments";
import { toast } from "@/components/ui/Toast";

type Material = {
  id: number;
  title: string;
  url: string;
  type: string;
};

type Comment = {
  id: number;
  userId?: number;
  author: string;
  avatar: string;
  message: string;
  createdAt?: string | null;
  adminReply?: string | null;
};

type LessonTabsProps = {
  lessonId: number;
  resumo: string;
  dicas?: string | null;
  materials: Material[];
  comments: Comment[];
};

function materialIcon(type: string) {
  if (type === "pdf") return <MdPictureAsPdf size={24} />;
  if (type === "audio" || type === "mp3") return <MdMusicNote size={24} />;
  if (type === "video") return <MdVideocam size={24} />;
  if (type === "image") return <MdImage size={24} />;
  return <MdInsertDriveFile size={24} />;
}

function materialAccent(type: string) {
  if (type === "pdf") return "bg-red-50 text-red-500";
  if (type === "audio" || type === "mp3") return "bg-blue-50 text-blue-500";
  if (type === "video") return "bg-violet-50 text-violet-500";
  if (type === "image") return "bg-amber-50 text-amber-500";
  return "bg-slate-100 text-slate-500";
}

export default function LessonTabs({
  lessonId,
  resumo,
  dicas,
  materials,
  comments: initialComments,
}: LessonTabsProps) {
  const [activeTab, setActiveTab] = useState<"resumo" | "comentarios">(
    "resumo",
  );
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isSubmitting, startTransition] = useTransition();

  const commentsCount = useMemo(() => comments.length, [comments]);

  const handleAddComment = () => {
    const value = commentInput.trim();
    if (!value) return;

    startTransition(async () => {
      const result = await createLessonCommentAction(lessonId, value);

      if (!result.success) {
        toast("Nao foi possivel enviar comentario", {
          description: result.error,
          variant: "error",
        });
        return;
      }

      const newComment: Comment = {
        id: result.data.id,
        userId: result.data.user?.id,
        author: result.data.user?.name ?? "Aluno",
        avatar: (result.data.user?.name ?? "Aluno")
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() ?? "")
          .join(""),
        message: result.data.content,
        createdAt: result.data.created_at,
        adminReply: result.data.admin_reply,
      };

      setComments((prev) => [newComment, ...prev]);
      setCommentInput("");
    });
  };

  return (
    <div>
      <ul className="border-ink/15 flex gap-4 border-b px-4 pb-3">
        <li>
          <button
            type="button"
            onClick={() => setActiveTab("resumo")}
            className={`cursor-pointer border-b-2 pb-1 text-sm font-bold transition-colors ${
              activeTab === "resumo"
                ? "text-ink border-accent"
                : "text-ink/50 hover:text-ink/80 border-transparent"
            }`}
          >
            Resumo da aula
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setActiveTab("comentarios")}
            className={`cursor-pointer border-b-2 pb-1 text-sm font-bold transition-colors ${
              activeTab === "comentarios"
                ? "text-ink border-accent"
                : "text-ink/50 hover:text-ink/80 border-transparent"
            }`}
          >
            Comentários ({commentsCount})
          </button>
        </li>
      </ul>

      {activeTab === "resumo" ? (
        <div className="flex w-full flex-col justify-between gap-10 p-8 lg:flex-row">
          <div className="flex flex-1 flex-col gap-6 lg:max-w-1/2">
            <p className="text-ink/85">{resumo}</p>

            {dicas && (
              <div className="border-accent bg-surface-soft rounded-bento-sm flex flex-col gap-1 border-l-4 px-4 py-2">
                <h1 className="text-ink font-bold">Dicas para praticar</h1>
                <p className="text-ink/80">{dicas}</p>
              </div>
            )}
          </div>

          <div className="w-full space-y-4 lg:w-80">
            <div className="mb-6 flex items-center gap-3">
              <MdFolder className="text-accent size-7" />
              <h2 className="text-ink text-lg leading-tight font-bold">
                Materiais de <br /> Referência
              </h2>
            </div>

            {materials.length === 0 && (
              <div className="border-ink/15 bg-surface-soft rounded-bento-sm text-ink/60 border border-dashed p-4 text-sm">
                Esta aula ainda não possui materiais complementares.
              </div>
            )}

            {materials.map((material) => (
              <a
                key={material.id}
                href={material.url}
                target="_blank"
                rel="noreferrer"
                className="border-ink/10 bg-surface-soft rounded-bento-sm flex items-center gap-4 border p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-lg ${materialAccent(material.type)}`}
                >
                  {materialIcon(material.type)}
                </div>

                <div className="flex-1">
                  <h3 className="text-ink text-sm leading-snug font-bold">
                    {material.title}
                  </h3>
                  <p className="text-ink/40 text-[10px] font-medium uppercase">
                    {material.type}
                  </p>
                </div>

                <MdOutlineFileDownload className="text-ink/35 size-6" />
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-surface space-y-5 p-4 md:p-6">
          {comments.length === 0 && (
            <div className="bg-surface-soft text-ink/60 rounded-bento-md p-4 text-sm">
              Nenhum comentário nesta aula ainda.
            </div>
          )}

          {comments.map((comment) => (
            <article
              key={comment.id}
              className="bg-surface-soft rounded-bento-md flex items-start gap-3 p-4"
            >
              <div className="border-accent bg-accent/10 text-accent flex size-12 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold">
                {comment.avatar}
              </div>
              <div>
                <p className="text-ink font-bold">{comment.author}</p>
                {comment.createdAt && (
                  <p className="text-ink/40 text-xs">
                    {new Date(comment.createdAt).toLocaleString("pt-BR")}
                  </p>
                )}
                <p className="text-ink/85 mt-1 text-[19px] leading-6">
                  {comment.message}
                </p>
                {comment.adminReply && (
                  <div className="border-accent/25 bg-accent/10 rounded-bento-sm mt-3 border p-3">
                    <p className="text-accent text-xs font-semibold tracking-wide uppercase">
                      Resposta da equipe
                    </p>
                    <p className="text-accent-ink mt-1 text-sm">
                      {comment.adminReply}
                    </p>
                  </div>
                )}
              </div>
            </article>
          ))}

          <div className="relative">
            <input
              type="text"
              value={commentInput}
              onChange={(event) => setCommentInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAddComment();
                }
              }}
              placeholder="Deixe seu comentário"
              className="border-ink/12 bg-surface-soft text-ink placeholder:text-ink/45 focus:border-accent rounded-bento-md w-full border py-4 pr-14 pl-4 transition-colors outline-none"
            />
            <button
              type="button"
              onClick={handleAddComment}
              disabled={isSubmitting}
              className="bg-accent absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-white transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-60"
              aria-label="Enviar comentário"
            >
              <MdSend className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
