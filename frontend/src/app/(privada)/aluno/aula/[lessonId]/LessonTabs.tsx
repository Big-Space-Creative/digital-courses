"use client";

import { useId, useMemo, useState, useTransition } from "react";
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
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
  const t = type.toLowerCase();
  if (t === "pdf") return <MdPictureAsPdf className="size-5" />;
  if (t === "audio" || t === "mp3") return <MdMusicNote className="size-5" />;
  if (t === "video") return <MdVideocam className="size-5" />;
  if (t === "image" || t === "png" || t === "jpg")
    return <MdImage className="size-5" />;
  return <MdInsertDriveFile className="size-5" />;
}

export default function LessonTabs({
  lessonId,
  resumo,
  dicas,
  materials,
  comments: initialComments,
}: LessonTabsProps) {
  const tabsId = useId();
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
        toast("Não foi possível enviar o comentário", {
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
      toast("Comentário publicado!", { variant: "success" });
    });
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div
        role="tablist"
        aria-label="Informações da aula"
        className="border-border bg-canvas/40 flex border-b px-4 sm:px-6"
      >
        <button
          type="button"
          role="tab"
          id={`${tabsId}-tab-resumo`}
          aria-controls={`${tabsId}-panel-resumo`}
          aria-selected={activeTab === "resumo"}
          onClick={() => setActiveTab("resumo")}
          className={`focus-visible:ring-accent flex cursor-pointer items-center gap-2 border-b-2 px-3 py-3.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 sm:text-sm ${
            activeTab === "resumo"
              ? "border-accent text-accent"
              : "text-text-muted hover:text-text border-transparent"
          }`}
        >
          <span>Resumo da aula</span>
        </button>

        <button
          type="button"
          role="tab"
          id={`${tabsId}-tab-comentarios`}
          aria-controls={`${tabsId}-panel-comentarios`}
          aria-selected={activeTab === "comentarios"}
          onClick={() => setActiveTab("comentarios")}
          className={`focus-visible:ring-accent flex cursor-pointer items-center gap-2 border-b-2 px-3 py-3.5 text-xs font-semibold transition-colors outline-none focus-visible:ring-2 sm:text-sm ${
            activeTab === "comentarios"
              ? "border-accent text-accent"
              : "text-text-muted hover:text-text border-transparent"
          }`}
        >
          <span>Comentários</span>
          <Badge variant="neutral" className="px-1.5 py-0.5 text-[11px]">
            {commentsCount}
          </Badge>
        </button>
      </div>

      {/* Tab Panel: Resumo */}
      {activeTab === "resumo" && (
        <div
          role="tabpanel"
          id={`${tabsId}-panel-resumo`}
          aria-labelledby={`${tabsId}-tab-resumo`}
          className="flex flex-col gap-8 p-5 sm:p-6 lg:flex-row lg:justify-between lg:p-8"
        >
          {/* Main Description */}
          <div className="flex flex-1 flex-col gap-6 lg:max-w-xl">
            <div>
              <h2 className="text-text-muted text-sm font-bold tracking-wider uppercase">
                Sobre este conteúdo
              </h2>
              <p className="text-text mt-2 text-sm leading-relaxed whitespace-pre-line sm:text-base">
                {resumo}
              </p>
            </div>

            {dicas && (
              <div className="border-accent bg-accent/5 rounded-[var(--radius-panel)] border-l-4 p-4 sm:p-5">
                <h3 className="text-accent text-sm font-bold">
                  Dicas para praticar
                </h3>
                <p className="text-text-muted mt-1 text-xs leading-relaxed sm:text-sm">
                  {dicas}
                </p>
              </div>
            )}
          </div>

          {/* Materials Sidebar */}
          <div className="w-full shrink-0 space-y-3 lg:w-80">
            <div className="border-border flex items-center gap-2 border-b pb-2">
              <MdFolder className="text-accent size-5" />
              <h3 className="text-text text-sm font-bold">
                Materiais de apoio
              </h3>
            </div>

            {materials.length === 0 ? (
              <div className="border-border text-text-muted rounded-[var(--radius-control)] border border-dashed p-4 text-center text-xs">
                Nenhum arquivo complementar para esta aula.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {materials.map((material) => (
                  <a
                    key={material.id}
                    href={material.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group border-border bg-panel hover:bg-canvas focus-visible:ring-accent flex items-center justify-between rounded-[var(--radius-control)] border p-3 shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-accent/10 text-accent flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-xs)]">
                        {materialIcon(material.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-text truncate text-xs font-medium sm:text-sm">
                          {material.title}
                        </p>
                        <span className="text-text-muted text-[10px] font-bold uppercase">
                          {material.type}
                        </span>
                      </div>
                    </div>
                    <MdOutlineFileDownload
                      className="text-text-muted size-5 shrink-0 transition-transform group-hover:translate-y-0.5"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Panel: Comentários */}
      {activeTab === "comentarios" && (
        <div
          role="tabpanel"
          id={`${tabsId}-panel-comentarios`}
          aria-labelledby={`${tabsId}-tab-comentarios`}
          className="flex flex-col gap-6 p-5 sm:p-6 lg:p-8"
        >
          {/* New Comment Input */}
          <div className="border-border bg-canvas/40 rounded-[var(--radius-panel)] border p-4">
            <label
              htmlFor={`${tabsId}-comment-input`}
              className="text-text mb-2 block text-xs font-semibold"
            >
              Tem alguma dúvida ou observação?
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id={`${tabsId}-comment-input`}
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder="Escreva sua dúvida sobre a aula..."
                className="border-border bg-panel text-text placeholder:text-text-muted focus-visible:ring-accent flex-1 rounded-[var(--radius-control)] border px-3.5 py-2.5 text-sm outline-none focus-visible:ring-2"
              />
              <Button
                variant="primary"
                size="md"
                onClick={handleAddComment}
                loading={isSubmitting}
                disabled={!commentInput.trim()}
                className="shrink-0 cursor-pointer gap-2"
              >
                <MdSend className="size-4" />
                <span>Enviar</span>
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="border-border text-text-muted rounded-[var(--radius-control)] border border-dashed p-6 text-center text-xs sm:text-sm">
              Nenhum comentário registrado nesta aula ainda. Seja o primeiro a
              participar!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {comments.map((comment) => (
                <article
                  key={comment.id}
                  className="border-border bg-panel rounded-[var(--radius-panel)] border p-4 shadow-xs transition-colors sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-accent/15 text-accent flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                      {comment.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-text text-sm font-semibold">
                          {comment.author}
                        </span>
                        {comment.createdAt && (
                          <time className="text-text-muted text-xs">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </time>
                        )}
                      </div>

                      <p className="text-text mt-1.5 text-sm leading-relaxed whitespace-pre-line">
                        {comment.message}
                      </p>

                      {/* Admin Reply */}
                      {comment.adminReply && (
                        <div className="border-accent/20 bg-accent/5 mt-3 rounded-[var(--radius-control)] border p-3.5">
                          <span className="text-accent text-[11px] font-bold tracking-wider uppercase">
                            Resposta do instrutor
                          </span>
                          <p className="text-text mt-1 text-xs leading-relaxed sm:text-sm">
                            {comment.adminReply}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
