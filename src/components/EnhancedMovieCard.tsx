import { MoviePoster } from "./MoviePoster";
import { MovieMetadataBadges } from "./MovieMetadataBadges";

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
      <MoviePoster poster={poster} title={title} onSave={onSave} />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">
          {title} {year && `(${year})`}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{synopsis}</p>
        
        <MovieMetadataBadges
          genre={genre}
          tone={tone}
          streaming={streaming}
          theme={theme}
          decade={decade}
        />
      </div>
    </div>
  );
}