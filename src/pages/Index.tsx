import { useState } from "react";
import { SearchPrompt } from "@/components/SearchPrompt";
import { Header } from "@/components/Header";
import { MovieResults } from "@/components/MovieResults";
import { supabase } from "@/integrations/supabase/client";
import { AuthDialog } from "@/components/AuthDialog";
import { useToast } from "@/components/ui/use-toast";

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
        <Header onSignInClick={() => setShowAuthDialog(true)} />
        <SearchPrompt onSearch={handleSearch} isLoading={isLoading} />
        <MovieResults 
          isLoading={isLoading}
          results={results}
          onSaveMovie={handleSave}
        />
      </div>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </div>
  );
};

export default Index;