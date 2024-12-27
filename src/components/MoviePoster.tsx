import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";

interface MoviePosterProps {
  poster: string;
  title: string;
  onSave?: () => void;
}

export function MoviePoster({ poster, title, onSave }: MoviePosterProps) {
  return (
    <div className="relative aspect-[2/3] overflow-hidden">
      <img
        src={poster || "/placeholder.svg"}
        alt={title}
        className="object-cover w-full h-full"
      />
      {onSave && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2"
          onClick={onSave}
        >
          <BookmarkPlus className="w-4 h-4 mr-2" />
          Save
        </Button>
      )}
    </div>
  );
}