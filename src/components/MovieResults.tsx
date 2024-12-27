import { motion, AnimatePresence } from "framer-motion";
import { EnhancedMovieCard } from "@/components/EnhancedMovieCard";
import { LoadingState } from "@/components/LoadingState";
import { MovieDialog } from "@/components/MovieDialog";
import { useState } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";

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
  error?: {
    message: string;
  };
}

export function MovieResults({ isLoading, results, onSaveMovie, error }: MovieResultsProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setDialogOpen(true);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingState key="loading" />
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl mx-auto mt-8"
          >
            <Card className="bg-muted/50 border-primary/20">
              <CardContent className="pt-6">
                <CardDescription className="text-center text-base">
                  {error.message}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
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
                onClick={() => handleMovieClick(movie)}
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