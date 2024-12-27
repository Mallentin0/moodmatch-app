import { Badge } from "@/components/ui/badge";
import { Calendar, Tag, Globe } from "lucide-react";
import { getPlatformDisplayName } from "@/utils/platformUtils";

interface MovieMetadataBubblesProps {
  year?: string;
  genre?: string[];
  streaming?: string[];
}

export function MovieMetadataBubbles({ year, genre = [], streaming = [] }: MovieMetadataBubblesProps) {
  return (
    <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-2">
      {year && (
        <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm text-white flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {year}
        </Badge>
      )}
      {genre.slice(0, 2).map((g) => (
        <Badge 
          key={g} 
          variant="secondary"
          className="bg-black/60 backdrop-blur-sm text-white flex items-center gap-1"
        >
          <Tag className="h-3 w-3" />
          {g}
        </Badge>
      ))}
      {streaming.slice(0, 2).map((platform) => (
        <Badge 
          key={platform}
          variant="secondary"
          className="bg-black/60 backdrop-blur-sm text-white flex items-center gap-1"
        >
          <Globe className="h-3 w-3" />
          {getPlatformDisplayName(platform)}
        </Badge>
      ))}
    </div>
  );
}