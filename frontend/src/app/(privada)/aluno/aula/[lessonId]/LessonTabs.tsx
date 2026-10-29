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
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";

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

  const tabItems = [
    {
      value: "resumo",
      label: "Sobre a aula",
      content: (
        <div className="flex flex-col gap-8 p-5 sm:p-6 lg:flex-row lg:justify-between lg:p-8">
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
                {/* Q11: text-accent-text */}
                <h3 className="text-accent-text text-sm font-bold">
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
              {/* Q11: text-accent-text */}
              <MdFolder className="text-accent-text size-5" />
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
                      {/* Q11: text-accent-text */}
                      <div className="bg-accent/10 text-accent-text flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-xs)]">
                        {materialIcon(material.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-text truncate text-xs font-medium sm:text-sm">
                          {material.title}
                        </p>
                        {/* Q11: mínimo 12px (text-xs) */}
                        <span className="text-text-muted text-xs font-bold uppercase">
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
      ),
    },
    {
      value: "comentarios",
      label: (
        <span className="inline-flex items-center gap-2">
          <span>Comentários</span>
          {/* Q11: mínimo 12px (text-xs) */}
          <Badge
            variant="neutral"
            className="px-1.5 py-0.5 text-xs font-semibold"
          >
            {commentsCount}
          </Badge>
        </span>
      ),
      content: (
        <div className="flex flex-col gap-6 p-5 sm:p-6 lg:p-8">
          {/* New Comment Input (Q05: usando primitivo Input compartilhado) */}
          <div className="border-border bg-canvas/40 rounded-[var(--radius-panel)] border p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input
                  id={`${tabsId}-comment-input`}
                  label="Tem alguma dúvida ou observação?"
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
                />
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleAddComment}
                loading={isSubmitting}
                disabled={!commentInput.trim()}
                className="shrink-0 cursor-pointer gap-2 font-semibold"
              >
                <MdSend className="size-4" aria-hidden="true" />
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
                    {/* Q11: text-accent-text */}
                    <div className="bg-accent/15 text-accent-text flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
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
                          {/* Q11: text-accent-text e mínimo 12px */}
                          <span className="text-accent-text text-xs font-bold tracking-wider uppercase">
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
      ),
    },
  ];

  return (
    <div>
      {/* Q05: Primitivo Tabs compartilhado com contrato de teclado completo */}
      <Tabs
        label="Informações da aula"
        defaultValue="resumo"
        items={tabItems}
        className="w-full"
      />
    </div>
  );
}
