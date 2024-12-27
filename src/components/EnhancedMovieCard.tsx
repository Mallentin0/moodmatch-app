import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";

interface MovieProps {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  onSave?: () => void;
}

export function EnhancedMovieCard({ title, year, poster, synopsis, streaming, onSave }: MovieProps) {
  return (
    <div className="glass-card rounded-lg overflow-hidden animate-in">
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
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">
          {title} {year && `(${year})`}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{synopsis}</p>
        {streaming && streaming.length > 0 && (
          <div className="text-sm text-gray-500">
            Available on: {streaming.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}