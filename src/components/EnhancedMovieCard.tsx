import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";
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
  return (
    <div className="glass-card rounded-lg overflow-hidden animate-in">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={poster || "/placeholder.svg"}
          alt={title}
          className="object-cover w-full h-full"
        />
        {onSave && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onSave}
          >
            <BookmarkPlus className="w-4 h-4 mr-2" />
            Save
          </Button>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">
          {title} {year && `(${year})`}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{synopsis}</p>
        
        <div className="space-y-2">
          {/* Streaming Platforms */}
          {streaming && streaming.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {streaming.map((platform) => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Genres */}
          {genre && genre.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {genre.map((g) => (
                <Badge key={g} variant="outline" className="text-xs bg-blue-50">
                  {g}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Tone */}
          {tone && tone.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tone.map((t) => (
                <Badge key={t} variant="outline" className="text-xs bg-purple-50">
                  {t}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Theme */}
          {theme && theme.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {theme.map((t) => (
                <Badge key={t} variant="outline" className="text-xs bg-green-50">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}