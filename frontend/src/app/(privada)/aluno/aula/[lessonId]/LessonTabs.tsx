"use client";

import { useMemo, useState } from "react";
import {
  MdFolder,
  MdImage,
  MdMusicNote,
  MdOutlineFileDownload,
  MdPictureAsPdf,
  MdSend,
} from "react-icons/md";

type Material = {
  id: string;
  title: string;
  url: string;
  type: string;
  size: string;
};

type Comment = {
  id: number;
  author: string;
  avatar: string;
  message: string;
};

type LessonTabsProps = {
  resumo: string;
  dicas: string;
  materials: Material[];
};

export default function LessonTabs({
  resumo,
  dicas,
  materials,
}: LessonTabsProps) {
  const [activeTab, setActiveTab] = useState<"resumo" | "comentarios">(
    "resumo",
  );
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "Gabriel Ferreira Camargo",
      avatar: "GF",
      message:
        "Melhor curso de violao, sem duvida nenhum recomendo, 10 estrelas",
    },
    {
      id: 2,
      author: "Gabriel Ferreira Camargo",
      avatar: "GF",
      message:
        "Melhor curso de violao, sem duvida nenhum recomendo, 10 estrelas",
    },
    {
      id: 3,
      author: "Gabriel Ferreira Camargo",
      avatar: "GF",
      message:
        "Melhor curso de violao, sem duvida nenhum recomendo, 10 estrelas",
    },
  ]);

  const commentsCount = useMemo(() => comments.length, [comments]);

  const handleAddComment = () => {
    const value = commentInput.trim();
    if (!value) {
      return;
    }

    setComments((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        author: "Voce",
        avatar: "VC",
        message: value,
      },
    ]);
    setCommentInput("");
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
            Resumo da Aula
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
            Comentarios ({commentsCount})
          </button>
        </li>
      </ul>

      {activeTab === "resumo" ? (
        <div className="flex w-full flex-col justify-between gap-10 p-8 lg:flex-row">
          <div className="flex flex-1 flex-col gap-6 lg:max-w-1/2">
            <p>{resumo}</p>

            <div className="flex flex-col gap-1 rounded-lg border-l-4 bg-slate-200 px-4 py-2">
              <h1 className="text-secondary font-bold">Dicas para praticar</h1>
              <p>{dicas}</p>
            </div>
          </div>

          <div className="w-full space-y-4 lg:w-80">
            <div className="mb-6 flex items-center gap-3">
              <MdFolder className="size-7 text-orange-500" />
              <h2 className="text-lg leading-tight font-bold text-slate-800">
                Materiais de <br /> Referencia
              </h2>
            </div>

            {materials.map((material) => {
              const isPdf = material.type === "pdf";
              const isAudio = material.type === "mp3";

              return (
                <a
                  key={material.id}
                  href={material.url}
                  download
                  className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    className={`flex size-12 items-center justify-center rounded-lg ${
                      isPdf
                        ? "bg-red-50 text-red-500"
                        : isAudio
                          ? "bg-blue-50 text-blue-500"
                          : "bg-amber-50 text-amber-500"
                    }`}
                  >
                    {isPdf ? (
                      <MdPictureAsPdf size={24} />
                    ) : isAudio ? (
                      <MdMusicNote size={24} />
                    ) : (
                      <MdImage size={24} />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm leading-snug font-bold text-slate-800">
                      {material.title}
                    </h3>
                    <p className="text-[10px] font-medium text-slate-400 uppercase">
                      {material.type} • {material.size}
                    </p>
                  </div>

                  <MdOutlineFileDownload className="size-6 text-slate-400" />
                </a>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-5 bg-[#f2f2f2] p-4 md:p-6">
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
                <p className="text-secondary/90 mt-1 text-[19px] leading-6">
                  {comment.message}
                </p>
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
              placeholder="Deixe seu comentario"
              className="w-full rounded-xl border border-slate-300 bg-white py-4 pr-14 pl-4 text-slate-700 transition-colors outline-none placeholder:text-slate-400 focus:border-orange-400"
            />
            <button
              type="button"
              onClick={handleAddComment}
              className="bg-primary absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-white transition-transform hover:scale-105"
              aria-label="Enviar comentario"
            >
              <MdSend className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
