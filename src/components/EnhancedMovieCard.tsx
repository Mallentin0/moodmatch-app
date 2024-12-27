import { MoviePoster } from "./MoviePoster";
import { MovieMetadataBadges } from "./MovieMetadataBadges";
import { Card, CardContent } from "@/components/ui/card";
import { Film, ThumbsUp, ThumbsDown, Info, Tv, Calendar, Tag, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
        
        {/* Metadata Bubbles */}
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
              {platform}
            </Badge>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-xl font-bold text-white">
            {title}
          </h3>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{synopsis}</p>
        
        {/* Theme Badges */}
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

        <div className="flex justify-between items-center pt-4 border-t border-primary/20">
          <Badge 
            variant="secondary" 
            className="flex items-center space-x-1 bg-primary/10 text-primary"
          >
            {type === 'movie' ? (
              <Film className="h-3 w-3 mr-1" />
            ) : type === 'show' ? (
              <Tv className="h-3 w-3 mr-1" />
            ) : (
              <Film className="h-3 w-3 mr-1" />
            )}
            <span className="capitalize">{type}</span>
          </Badge>
          
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-primary hover:text-primary hover:bg-primary/20"
              onClick={(e) => handleFeedback('like', e)}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-destructive hover:text-destructive hover:bg-destructive/20"
              onClick={(e) => handleFeedback('dislike', e)}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={(e) => handleFeedback('info', e)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}