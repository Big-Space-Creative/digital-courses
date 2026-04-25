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
      <ul className="border-secondary/20 flex gap-4 border-b px-4 pb-3">
        <li>
          <button
            type="button"
            onClick={() => setActiveTab("resumo")}
            className={`cursor-pointer border-b-2 pb-1 text-sm font-bold transition-colors ${
              activeTab === "resumo"
                ? "text-secondary border-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
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
                ? "text-secondary border-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Comentários ({commentsCount})
          </button>
        </li>
      </ul>

      {activeTab === "resumo" ? (
        <div className="flex w-full flex-col justify-between gap-10 p-8 lg:flex-row">
          <div className="flex flex-1 flex-col gap-6 lg:max-w-1/2">
            <p>{resumo}</p>

            {dicas && (
              <div className="flex flex-col gap-1 rounded-lg border-l-4 bg-slate-200 px-4 py-2">
                <h1 className="text-secondary font-bold">Dicas para praticar</h1>
                <p>{dicas}</p>
              </div>
            )}
          </div>

          <div className="w-full space-y-4 lg:w-80">
            <div className="mb-6 flex items-center gap-3">
              <MdFolder className="size-7 text-orange-500" />
              <h2 className="text-lg leading-tight font-bold text-slate-800">
                Materiais de <br /> Referência
              </h2>
            </div>

            {materials.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                Esta aula ainda não possui materiais complementares.
              </div>
            )}

            {materials.map((material) => (
              <a
                key={material.id}
                href={material.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-lg ${materialAccent(material.type)}`}
                >
                  {materialIcon(material.type)}
                </div>

                <div className="flex-1">
                  <h3 className="text-sm leading-snug font-bold text-slate-800">
                    {material.title}
                  </h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase">
                    {material.type}
                  </p>
                </div>

                <MdOutlineFileDownload className="size-6 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5 bg-[#f2f2f2] p-4 md:p-6">
          {comments.length === 0 && (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-500">
              Nenhum comentário nesta aula ainda.
            </div>
          )}

          {comments.map((comment) => (
            <article
              key={comment.id}
              className="flex items-start gap-3 rounded-2xl bg-white p-4"
            >
              <div className="border-primary flex size-12 shrink-0 items-center justify-center rounded-full border-2 bg-orange-50 text-xs font-bold text-orange-600">
                {comment.avatar}
              </div>
              <div>
                <p className="text-secondary font-bold">{comment.author}</p>
                {comment.createdAt && (
                  <p className="text-xs text-slate-400">
                    {new Date(comment.createdAt).toLocaleString("pt-BR")}
                  </p>
                )}
                <p className="text-secondary/90 mt-1 text-[19px] leading-6">
                  {comment.message}
                </p>
                {comment.adminReply && (
                  <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50 p-3">
                    <p className="text-xs font-semibold tracking-wide text-orange-700 uppercase">
                      Resposta da equipe
                    </p>
                    <p className="mt-1 text-sm text-orange-900">{comment.adminReply}</p>
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
              className="w-full rounded-xl border border-slate-300 bg-white py-4 pr-14 pl-4 text-slate-700 transition-colors outline-none placeholder:text-slate-400 focus:border-orange-400"
            />
            <button
              type="button"
              onClick={handleAddComment}
              disabled={isSubmitting}
              className="bg-primary absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-white transition-transform hover:scale-105"
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
