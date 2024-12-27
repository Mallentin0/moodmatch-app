import { useState, useEffect } from "react";
import { SearchPrompt } from "@/components/SearchPrompt";
import { EnhancedMovieCard } from "@/components/EnhancedMovieCard";
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
  theme?: string[];
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (prompt: string) => {
    setIsLoading(true);
    console.log("Searching with prompt:", prompt);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-movies', {
        body: { prompt }
      });
      
      console.log("Search response:", data);
      
      if (error) {
        console.error('Error searching movies:', error);
        toast({
          title: "Error",
          description: "Failed to get movie recommendations. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.movies || !Array.isArray(data.movies)) {
        console.error('Invalid response format:', data);
        toast({
          title: "Error",
          description: "Received invalid response format from server",
          variant: "destructive",
        });
        return;
      }

      // Sort movies to prioritize those with themes
      const sortedMovies = [...data.movies].sort((a, b) => {
        const aHasThemes = a.theme && a.theme.length > 0;
        const bHasThemes = b.theme && b.theme.length > 0;
        
        if (aHasThemes && !bHasThemes) return -1;
        if (!aHasThemes && bHasThemes) return 1;
        return 0;
      });

      console.log("Setting sorted results:", sortedMovies);
      setResults(sortedMovies);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
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
            Tell us what you're in the mood for, and we'll use AI to find the perfect movie or show for you.
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
              {results.map((movie, index) => (
                <EnhancedMovieCard 
                  key={`${movie.title}-${index}`}
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