import { Badge } from "@/components/ui/badge";

interface MovieMetadataBadgesProps {
  genre: string[];
  tone: string[];
  streaming: string[];
  theme: string[];
  decade: string;
}

export function MovieMetadataBadges({ 
  genre, 
  tone, 
  streaming, 
  theme, 
  decade 
}: MovieMetadataBadgesProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mb-1">
        <span>Genre</span>
        <span>Tone</span>
        <span>Platform</span>
        <span>Theme</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {genre.length > 0 ? (
          genre.map((g) => (
            <Badge key={g} variant="outline" className="text-xs bg-blue-50">
              {g}
            </Badge>
          ))
        ) : (
          <Badge variant="outline" className="text-xs bg-gray-50">No genre specified</Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tone.length > 0 ? (
          tone.map((t) => (
            <Badge key={t} variant="outline" className="text-xs bg-purple-50">
              {t}
            </Badge>
          ))
        ) : (
          <Badge variant="outline" className="text-xs bg-gray-50">No tone specified</Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {streaming.length > 0 ? (
          streaming.map((platform) => (
            <Badge key={platform} variant="secondary" className="text-xs">
              {platform}
            </Badge>
          ))
        ) : (
          <Badge variant="secondary" className="text-xs">No platform info</Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {theme.length > 0 ? (
          theme.map((t) => (
            <Badge key={t} variant="outline" className="text-xs bg-green-50">
              {t}
            </Badge>
          ))
        ) : (
          <Badge variant="outline" className="text-xs bg-gray-50">No theme specified</Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <Badge variant="outline" className="text-xs bg-yellow-50">
          {decade}
        </Badge>
      </div>
    </div>
  );
}