interface MoviePosterProps {
  poster: string;
  title: string;
}

export function MoviePoster({ poster, title }: MoviePosterProps) {
  return (
    <div className="relative aspect-[2/3] overflow-hidden">
      <img
        src={poster || "/placeholder.svg"}
        alt={title}
        className="object-cover w-full h-full"
      />
    </div>
  );
}