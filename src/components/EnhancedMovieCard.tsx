import { MoviePoster } from "./MoviePoster";
import { MovieMetadataBadges } from "./MovieMetadataBadges";
import { Card, CardContent } from "@/components/ui/card";
import { Film, ThumbsUp, ThumbsDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MovieProps {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  genre?: string[];
  tone?: string[];
  theme?: string[];
  onSave?: () => void;
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
  onSave 
}: MovieProps) {
  const decade = year ? `${year.slice(0, 3)}0s` : 'Unknown';

  return (
    <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:shadow-primary/20 bg-card border-primary/20">
      <div className="relative">
        <MoviePoster poster={poster} title={title} onSave={onSave} />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-xl font-bold text-white">
            {title} {year && `(${year})`}
          </h3>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{synopsis}</p>
        
        <MovieMetadataBadges
          genre={genre}
          tone={tone}
          streaming={streaming}
          theme={theme}
          decade={decade}
        />

        <div className="flex justify-between items-center pt-4 border-t border-primary/20">
          {streaming.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Film className="h-4 w-4" />
              <span>{streaming.join(", ")}</span>
            </div>
          )}
          
          <div className="flex space-x-2 ml-auto">
            <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/20">
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/20">
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted">
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}