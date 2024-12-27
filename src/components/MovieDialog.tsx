import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MovieMetadataBadges } from "./MovieMetadataBadges";
import { Film, Clock, Star, User, Users } from "lucide-react";
import { Badge } from "./ui/badge";

interface MovieDialogProps {
  movie: {
    title: string;
    year: string;
    poster: string;
    synopsis: string;
    streaming?: string[];
    genre?: string[];
    tone?: string[];
    theme?: string[];
    ratings?: {
      source: string;
      value: string;
    }[];
    runtime?: string;
    director?: string;
    actors?: string[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieDialog({ movie, open, onOpenChange }: MovieDialogProps) {
  if (!movie) return null;

  const decade = movie.year ? `${movie.year.slice(0, 3)}0s` : 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {movie.title} {movie.year && `(${movie.year})`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
            <img
              src={movie.poster}
              alt={movie.title}
              className="object-cover w-full h-full"
            />
          </div>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">{movie.synopsis}</p>
            
            {movie.runtime && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{movie.runtime}</span>
              </div>
            )}

            {movie.director && (
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Directed by {movie.director}</span>
              </div>
            )}

            {movie.actors && movie.actors.length > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Starring {movie.actors.join(', ')}</span>
              </div>
            )}

            {movie.ratings && movie.ratings.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Ratings</span>
                <div className="flex flex-wrap gap-2">
                  {movie.ratings.map((rating) => (
                    <Badge 
                      key={rating.source} 
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <Star className="h-3 w-3" />
                      <span>{rating.source}: {rating.value}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <MovieMetadataBadges
              genre={movie.genre || []}
              tone={movie.tone || []}
              streaming={movie.streaming || []}
              theme={movie.theme || []}
              decade={decade}
            />

            {movie.streaming && movie.streaming.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-4 border-t">
                <Film className="h-4 w-4" />
                <span>Available on {movie.streaming.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}