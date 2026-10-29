"use client";

import { useEffect, useRef, useState } from "react";
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
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [prevUrl, setPrevUrl] = useState(lessonVideoUrl);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (lessonVideoUrl !== prevUrl) {
    setPrevUrl(lessonVideoUrl);
    setHasError(false);
    setIsLoading(Boolean(lessonVideoUrl));
    setHasTimedOut(false);
  }

  // Q20: Timeout para espera indefinida (ex: restrição de preload/dados pelo navegador)
  useEffect(() => {
    if (!isLoading || hasError) return;
    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasTimedOut(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [isLoading, hasError, reloadKey]);

  const handleRetry = () => {
    setHasError(false);
    setHasTimedOut(false);
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
      {/* Q20: pointer-events-none para que toques e cliques alcancem os controles nativos do vídeo */}
      {isLoading && !hasError && (
        <div
          role="status"
          aria-live="polite"
          className="bg-media/60 pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 backdrop-blur-xs"
        >
          {/* Q17: spinner com motion-reduce:animate-none */}
          <div
            className="size-10 animate-spin rounded-full border-3 border-[#535b60] border-t-[#ff6b07] motion-reduce:animate-none"
            aria-hidden="true"
          />
          <span className="text-xs font-medium text-[#f5f7f8]">
            Carregando vídeo...
          </span>
        </div>
      )}

      {/* Q20: Aviso de carregamento lento com ação de retry sem bloquear controles nativos */}
      {hasTimedOut && !hasError && (
        <div
          role="status"
          className="bg-media/90 absolute top-3 right-3 z-20 flex items-center gap-2.5 rounded-[var(--radius-control)] border border-[#535b60] p-2.5 shadow-md"
        >
          <span className="text-xs text-[#bac2c7]">
            Demorando para iniciar?
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRetry}
            className="gap-1 border-[#535b60] bg-white/10 text-xs text-[#f5f7f8] hover:bg-white/15"
          >
            <MdRefresh className="size-3.5" aria-hidden="true" />
            Recarregar
          </Button>
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
          onLoadStart={() => {
            setIsLoading(true);
            setHasTimedOut(false);
          }}
          onLoadedMetadata={() => setIsLoading(false)}
          onCanPlay={() => setIsLoading(false)}
          onLoadedData={() => setIsLoading(false)}
          onPlay={() => {
            setIsLoading(false);
            setHasTimedOut(false);
          }}
          onPlaying={() => {
            setIsLoading(false);
            setHasTimedOut(false);
          }}
          onError={() => {
            setIsLoading(false);
            setHasTimedOut(false);
            setHasError(true);
          }}
          className="h-full w-full object-contain"
        />
      )}
    </div>
  );
}
