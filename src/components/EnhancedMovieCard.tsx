import { MoviePoster } from "./MoviePoster";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MovieMetadataBubbles } from "./MovieMetadataBubbles";
import { MovieFeedbackButtons } from "./MovieFeedbackButtons";
import { getPlatformDisplayName } from "@/utils/platformUtils";
import { Globe } from "lucide-react";

interface MovieProps {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  genre?: string[];
  tone?: string[];
  theme?: string[];
  type?: 'movie' | 'show' | 'anime';
  onSave?: () => void;
  onClick?: () => void;
  onFeedback?: (type: 'like' | 'dislike' | 'info', title: string) => void;
}

export function EnhancedMovieCard({ 
  title, 
  year, 
  poster, 
  synopsis, 
  streaming = [], 
  genre = [],
  tone = [],
  theme = [],
  type = 'movie',
  onSave,
  onClick,
  onFeedback
}: MovieProps) {
  const handleFeedback = (feedbackType: 'like' | 'dislike' | 'info', e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFeedback) {
      onFeedback(feedbackType, title);
    }
  };

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:shadow-primary/20 bg-card border-primary/20 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <MoviePoster poster={poster} title={title} onSave={onSave} />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        <MovieMetadataBubbles
          year={year}
          genre={genre}
          streaming={streaming}
        />

        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-xl font-bold text-white mb-2">
            {title}
          </h3>
          {streaming.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {streaming.map((platform) => (
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
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{synopsis}</p>
        
        {theme.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {theme.map((t) => (
              <Badge 
                key={t}
                variant="outline"
                className="text-xs"
              >
                {t}
              </Badge>
            ))}
          </div>
        )}

        <MovieFeedbackButtons
          type={type}
          onFeedback={handleFeedback}
        />
      </CardContent>
    </Card>
  );
}