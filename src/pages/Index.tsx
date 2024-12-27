import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchPrompt } from "@/components/SearchPrompt";
import { MovieCard } from "@/components/MovieCard";
import { LoadingState } from "@/components/LoadingState";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { AuthDialog } from "@/components/AuthDialog";
import { useToast } from "@/components/ui/use-toast";

interface Movie {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = async (prompt: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-movies', {
        body: { prompt }
      });
      
      if (error) {
        console.error('Error searching movies:', error);
        return;
      }

      setResults(data.movies);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (movie: Movie) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setShowAuthDialog(true);
      toast({
        title: "Sign in required",
        description: "Please sign in to save recommendations",
      });
      return;
    }
    // TODO: Implement save functionality
    toast({
      title: "Coming soon",
      description: "Saving recommendations will be available soon!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="max-w-7xl mx-auto py-12">
        <div className="flex justify-end mb-8">
          <Button
            variant="outline"
            onClick={() => setShowAuthDialog(true)}
            className="flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">MoodMatch</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tell us what you're in the mood for, and we'll find the perfect movie or show for you.
          </p>
        </motion.div>

        <SearchPrompt onSearch={handleSearch} isLoading={isLoading} />

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
              {results.map((movie) => (
                <MovieCard 
                  key={movie.title} 
                  {...movie} 
                  onSave={() => handleSave(movie)}
                />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </div>
  );
};

export default Index;