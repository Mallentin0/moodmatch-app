import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MovieMetadataBadges } from "./MovieMetadataBadges";
import { Film, Star, Clock, Users, Video, DollarSign, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MovieDialogProps {
  movie: {
    title: string;
    year: string;
    poster: string;
    backdrop?: string | null;
    synopsis: string;
    streaming?: string[];
    genre?: string[];
    tone?: string[];
    theme?: string[];
    rating?: string;
    runtime?: { hours: number; minutes: number } | null;
    director?: string;
    cast?: string[];
    production?: string[];
    tagline?: string | null;
    language?: string;
    budget?: string;
    revenue?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieDialog({ movie, open, onOpenChange }: MovieDialogProps) {
  if (!movie) return null;

  const decade = movie.year ? `${movie.year.slice(0, 3)}0s` : 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">
            {movie.title} {movie.year && `(${movie.year})`}
          </DialogTitle>
          {movie.tagline && (
            <DialogDescription className="text-lg italic text-muted-foreground">
              "{movie.tagline}"
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
              <img
                src={movie.poster}
                alt={movie.title}
                className="object-cover w-full h-full"
              />
            </div>

            {movie.backdrop && (
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <img
                  src={movie.backdrop}
                  alt={`${movie.title} backdrop`}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <p className="text-muted-foreground">{movie.synopsis}</p>
            
            <div className="grid grid-cols-2 gap-4">
              {movie.rating && (
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{movie.rating}/10</span>
                </div>
              )}
              
              {movie.runtime && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {movie.runtime.hours}h {movie.runtime.minutes}m
                  </span>
                </div>
              )}
              
              {movie.language && (
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>{movie.language}</span>
                </div>
              )}
            </div>

            <Separator />
            
            {movie.director && (
              <div className="space-y-2">
                <h4 className="font-semibold">Director</h4>
                <p>{movie.director}</p>
              </div>
            )}
            
            {movie.cast && movie.cast.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Cast
                </h4>
                <p>{movie.cast.join(", ")}</p>
              </div>
            )}
            
            {movie.production && movie.production.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Production
                </h4>
                <p>{movie.production.join(", ")}</p>
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

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              {movie.budget !== 'N/A' && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Budget: {movie.budget}</span>
                </div>
              )}
              
              {movie.revenue !== 'N/A' && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Revenue: {movie.revenue}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}