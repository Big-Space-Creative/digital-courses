"use client";

import { useRef, useState } from "react";
import { MdRefresh, MdVideocamOff } from "react-icons/md";
import { Button } from "./Button";

export type VideoPlayerProps = {
  lessonVideoUrl: string;
  title?: string;
};

export default function VideoPlayer({
  lessonVideoUrl,
  title = "Vídeo da aula",
}: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(lessonVideoUrl));
  const [reloadKey, setReloadKey] = useState(0);
  const [prevUrl, setPrevUrl] = useState(lessonVideoUrl);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (lessonVideoUrl !== prevUrl) {
    setPrevUrl(lessonVideoUrl);
    setHasError(false);
    setIsLoading(Boolean(lessonVideoUrl));
  }

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  if (!lessonVideoUrl) {
    return (
      <div
        role="status"
        aria-label="Vídeo não disponível"
        className="bg-media border-border flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-[var(--radius-panel)] border px-6 text-center text-[#bac2c7]"
      >
        <div
          className="rounded-full bg-white/5 p-4 text-[#f5f7f8]/70"
          aria-hidden="true"
        >
          <MdVideocamOff className="size-8" />
        </div>
        <p className="text-sm font-medium">
          Vídeo ainda não disponível para esta aula.
        </p>
        <p className="text-xs text-[#bac2c7]/80">
          O conteúdo será publicado em breve pelo instrutor.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-media border-border relative aspect-video w-full overflow-hidden rounded-[var(--radius-panel)] border shadow-[var(--shadow-panel)]">
      {isLoading && !hasError && (
        <div
          role="status"
          aria-live="polite"
          className="bg-media/80 absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 backdrop-blur-xs"
        >
          <div
            className="size-10 animate-spin rounded-full border-3 border-[#535b60] border-t-[#ff6b07]"
            aria-hidden="true"
          />
          <span className="text-xs font-medium text-[#f5f7f8]">
            Carregando vídeo...
          </span>
        </div>
      )}

      {hasError ? (
        <div
          role="alert"
          className="bg-media absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 p-6 text-center"
        >
          <div
            className="rounded-full bg-red-500/10 p-3 text-red-400"
            aria-hidden="true"
          >
            <MdVideocamOff className="size-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#f5f7f8]">
              Falha ao carregar o vídeo
            </h3>
            <p className="mt-1 text-xs text-[#bac2c7]">
              Ocorreu um problema ao conectar com o serviço de streaming.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRetry}
            className="inline-flex cursor-pointer items-center gap-2 border-[#535b60] bg-white/10 text-[#f5f7f8] hover:bg-white/15"
          >
            <MdRefresh className="size-4" />
            Tentar novamente
          </Button>
        </div>
      ) : (
        <video
          key={reloadKey}
          ref={videoRef}
          src={lessonVideoUrl}
          title={title}
          controls
          controlsList="nodownload"
          playsInline
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className="h-full w-full object-contain"
        />
      )}
    </div>
  );
}
