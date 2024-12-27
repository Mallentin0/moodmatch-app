import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MovieMetadataBadges } from "./MovieMetadataBadges";
import { Film, Clock, Star, User, Users, Calendar, Award, Globe, Tv } from "lucide-react";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

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
    type?: 'movie' | 'show' | 'anime';
    originalTitle?: string;
    language?: string;
    awards?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieDialog({ movie, open, onOpenChange }: MovieDialogProps) {
  if (!movie) return null;

  const decade = movie.year ? `${movie.year.slice(0, 3)}0s` : 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {movie.type === 'movie' ? (
              <Film className="h-5 w-5" />
            ) : movie.type === 'show' ? (
              <Tv className="h-5 w-5" />
            ) : (
              <Globe className="h-5 w-5" />
            )}
            {movie.title} {movie.year && `(${movie.year})`}
          </DialogTitle>
          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="text-sm text-muted-foreground">
              Original Title: {movie.originalTitle}
            </p>
          )}
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pr-4">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
              <img
                src={movie.poster}
                alt={movie.title}
                className="object-cover w-full h-full"
              />
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Synopsis</h3>
                <p className="text-muted-foreground">{movie.synopsis}</p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
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

                {movie.language && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>Language: {movie.language}</span>
                  </div>
                )}

                {movie.awards && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>{movie.awards}</span>
                  </div>
                )}
              </div>

              <Separator />

              {movie.ratings && movie.ratings.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Ratings</h3>
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
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Categories</h3>
                <MovieMetadataBadges
                  genre={movie.genre || []}
                  tone={movie.tone || []}
                  streaming={movie.streaming || []}
                  theme={movie.theme || []}
                  decade={decade}
                />
              </div>

              {movie.streaming && movie.streaming.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-4 border-t">
                  <Film className="h-4 w-4" />
                  <span>Available on {movie.streaming.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}