export default function VideoPlayer({
  lessonVideoUrl,
}: {
  lessonVideoUrl: string;
}) {
  if (!lessonVideoUrl) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-black text-sm text-white/60">
        Vídeo ainda não disponível para esta aula.
      </div>
    );
  }

  return (
    <video
      src={lessonVideoUrl}
      controls
      controlsList="nodownload"
      className="aspect-video w-full rounded-2xl bg-black shadow-2xl"
    />
  );
}
