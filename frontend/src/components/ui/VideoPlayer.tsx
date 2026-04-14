export default function VideoPlayer({
  lessonVideoUrl,
}: {
  lessonVideoUrl: string;
}) {
  return (
    <video
      src={lessonVideoUrl}
      controls
      className="aspect-video w-full rounded-2xl bg-black"
    />
  );
}
