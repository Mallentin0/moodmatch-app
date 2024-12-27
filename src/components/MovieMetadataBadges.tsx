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
        {genre.length > 0 && <span>Genre</span>}
        {tone.length > 0 && <span>Tone</span>}
        {streaming.length > 0 && <span>Platform</span>}
        {theme.length > 0 && <span>Theme</span>}
      </div>

      {genre.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {genre.map((g) => (
            <Badge key={g} variant="outline" className="text-xs bg-blue-50">
              {g}
            </Badge>
          ))}
        </div>
      )}
      
      {tone.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tone.map((t) => (
            <Badge key={t} variant="outline" className="text-xs bg-purple-50">
              {t}
            </Badge>
          ))}
        </div>
      )}
      
      {streaming.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {streaming.map((platform) => (
            <Badge key={platform} variant="secondary" className="text-xs">
              {platform}
            </Badge>
          ))}
        </div>
      )}
      
      {theme.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {theme.map((t) => (
            <Badge key={t} variant="outline" className="text-xs bg-green-50">
              {t}
            </Badge>
          ))}
        </div>
      )}

      {decade && decade !== 'Unknown' && (
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="text-xs bg-yellow-50">
            {decade}
          </Badge>
        </div>
      )}
    </div>
  );
}