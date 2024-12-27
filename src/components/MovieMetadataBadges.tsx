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
    <div className="space-y-4">
      {/* Genre Section */}
      {genre.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Genre</span>
          <div className="flex flex-wrap gap-2">
            {genre.map((g) => (
              <Badge 
                key={g} 
                variant="secondary" 
                className="bg-secondary/80 text-secondary-foreground backdrop-blur-sm"
              >
                {g}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Platform Section */}
      {streaming.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Platform</span>
          <div className="flex flex-wrap gap-2">
            {streaming.map((platform) => (
              <Badge 
                key={platform} 
                variant="secondary"
                className="bg-secondary/80 text-secondary-foreground backdrop-blur-sm"
              >
                {platform}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Tone Section */}
      {tone.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Tone</span>
          <div className="flex flex-wrap gap-2">
            {tone.map((t) => (
              <Badge 
                key={t} 
                variant="secondary"
                className="bg-secondary/80 text-secondary-foreground backdrop-blur-sm"
              >
                {t}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Theme Section */}
      {theme.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Theme</span>
          <div className="flex flex-wrap gap-2">
            {theme.map((t) => (
              <Badge 
                key={t} 
                variant="secondary"
                className="bg-secondary/80 text-secondary-foreground backdrop-blur-sm"
              >
                {t}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Decade Badge */}
      {decade && decade !== 'Unknown' && (
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="secondary"
            className="bg-secondary/80 text-secondary-foreground backdrop-blur-sm"
          >
            {decade}
          </Badge>
        </div>
      )}
    </div>
  );
}