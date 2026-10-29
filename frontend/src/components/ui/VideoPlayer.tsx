export default function VideoPlayer({
  lessonVideoUrl,
}: {
  lessonVideoUrl: string;
}) {
  if (!lessonVideoUrl) {
    return (
      <div
        role="status"
        className="flex aspect-video w-full items-center justify-center rounded-bento-md bg-ink px-6 text-center text-sm text-surface/80"
      >
        Vídeo ainda não disponível para esta aula.
      </div>
    );
  }

  return (
    <video
      src={lessonVideoUrl}
      controls
      controlsList="nodownload"
      className="aspect-video w-full rounded-bento-md bg-ink ring-1 ring-ink/10"
    />
  );
}
