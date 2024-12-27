import { Card } from "@/components/ui/card";
import { MoviePoster } from "@/components/MoviePoster";
import { MovieMetadataBadges } from "@/components/MovieMetadataBadges";
import { MovieFeedbackButtons } from "@/components/MovieFeedbackButtons";

interface EnhancedMovieCardProps {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  theme?: string[];
  genre?: string[];
  tone?: string[];
  onClick?: () => void;
  onFeedback?: (type: 'like' | 'dislike' | 'info', title: string) => void;
}

export function EnhancedMovieCard({
  title,
  year,
  poster,
  synopsis,
  streaming,
  theme,
  genre,
  tone,
  onClick,
  onFeedback,
}: EnhancedMovieCardProps) {
  return (
    <Card 
      className="relative overflow-hidden group cursor-pointer glass-card w-full max-w-sm animate-fade-in"
      onClick={onClick}
    >
      <div className="p-4">
        <MoviePoster 
          poster={poster} 
          title={title}
          className="w-full"
        />
        <div className="mt-4">
          <h3 className="text-lg font-semibold">{title} ({year})</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{synopsis}</p>
          
          <MovieMetadataBadges
            streaming={streaming}
            theme={theme}
            genre={genre}
            tone={tone}
          />
          
          {onFeedback && (
            <MovieFeedbackButtons
              title={title}
              onFeedback={onFeedback}
            />
          )}
        </div>
      </div>
    </Card>
  );
}