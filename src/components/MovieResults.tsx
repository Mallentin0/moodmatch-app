import { motion, AnimatePresence } from "framer-motion";
import { EnhancedMovieCard } from "@/components/EnhancedMovieCard";
import { LoadingState } from "@/components/LoadingState";

interface Movie {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  theme?: string[];
  genre?: string[];
  tone?: string[];
}

interface MovieResultsProps {
  isLoading: boolean;
  results: Movie[];
  onSaveMovie: (movie: Movie) => void;
}

export function MovieResults({ isLoading, results, onSaveMovie }: MovieResultsProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <LoadingState key="loading" />
      ) : results.length > 0 ? (
        <motion.div
          key="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
        >
          {results.map((movie, index) => (
            <EnhancedMovieCard 
              key={`${movie.title}-${index}`}
              {...movie} 
              onSave={() => onSaveMovie(movie)}
            />
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}