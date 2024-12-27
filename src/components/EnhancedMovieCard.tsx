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
  const decade = year ? `${year.slice(0, 3)}0s` : 'Unknown';

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
          {/* Category Labels */}
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mb-1">
            <span>Genre</span>
            <span>Tone</span>
            <span>Platform</span>
            <span>Theme</span>
          </div>

          {/* Genre Section */}
          <div className="flex flex-wrap gap-2">
            {genre.length > 0 ? (
              genre.map((g) => (
                <Badge key={g} variant="outline" className="text-xs bg-blue-50">
                  {g}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="text-xs bg-gray-50">No genre specified</Badge>
            )}
          </div>
          
          {/* Tone Section */}
          <div className="flex flex-wrap gap-2">
            {tone.length > 0 ? (
              tone.map((t) => (
                <Badge key={t} variant="outline" className="text-xs bg-purple-50">
                  {t}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="text-xs bg-gray-50">No tone specified</Badge>
            )}
          </div>
          
          {/* Streaming Platforms Section */}
          <div className="flex flex-wrap gap-2">
            {streaming.length > 0 ? (
              streaming.map((platform) => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  {platform}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="text-xs">No platform info</Badge>
            )}
          </div>
          
          {/* Theme Section */}
          <div className="flex flex-wrap gap-2">
            {theme.length > 0 ? (
              theme.map((t) => (
                <Badge key={t} variant="outline" className="text-xs bg-green-50">
                  {t}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="text-xs bg-gray-50">No theme specified</Badge>
            )}
          </div>

          {/* Decade Badge */}
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs bg-yellow-50">
              {decade}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}