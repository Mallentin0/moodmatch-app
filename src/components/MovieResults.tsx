import { motion, AnimatePresence } from "framer-motion";
import { EnhancedMovieCard } from "@/components/EnhancedMovieCard";
import { LoadingState } from "@/components/LoadingState";
import { MovieDialog } from "@/components/MovieDialog";
import { useState } from "react";

interface Movie {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  theme?: string[];
  genre?: string[];
  tone?: string[];
  type?: 'movie' | 'show' | 'anime';
}

interface MovieResultsProps {
  isLoading: boolean;
  results: Movie[];
  onSaveMovie: (movie: Movie) => void;
  onFeedback?: (type: 'like' | 'dislike' | 'info', title: string) => void;
}

export function MovieResults({ isLoading, results, onSaveMovie, onFeedback }: MovieResultsProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setDialogOpen(true);
  };

  // Filter out any results with "Hentai" in their genres
  const filteredResults = results.filter(movie => 
    !movie.genre?.some(g => g.toLowerCase() === 'hentai')
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingState key="loading" />
        ) : filteredResults.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
          >
            {filteredResults.map((movie, index) => (
              <EnhancedMovieCard 
                key={`${movie.title}-${index}`}
                {...movie} 
                onSave={() => onSaveMovie(movie)}
                onClick={() => handleMovieClick(movie)}
                onFeedback={onFeedback}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <MovieDialog
        movie={selectedMovie}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}