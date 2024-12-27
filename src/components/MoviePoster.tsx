import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";

interface MoviePosterProps {
  poster: string;
  title: string;
  onSave?: () => void;
}

export function MoviePoster({ poster, title, onSave }: MoviePosterProps) {
  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave();
    }
  };

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
          className="absolute top-2 right-2 z-50 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={handleSaveClick}
        >
          <BookmarkPlus className="w-4 h-4 mr-2" />
          Save
        </Button>
      )}
    </div>
  );
}