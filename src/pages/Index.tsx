import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchPrompt } from "@/components/SearchPrompt";
import { MovieCard } from "@/components/MovieCard";
import { LoadingState } from "@/components/LoadingState";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

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
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    checkAuth();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="max-w-7xl mx-auto py-12">
        <div className="flex justify-end mb-8">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
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
                <MovieCard key={movie.title} {...movie} />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;