import { useState } from "react";
import { SearchSection } from "@/components/SearchSection";
import { MovieResults } from "@/components/MovieResults";
import { RefinementOptions } from "@/components/RefinementOptions";
import { MediaType, Movie } from "@/types/media";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface MediaSearchProps {
  activeTab: MediaType;
  refinementOptions: Array<{ label: string; prompt: string; }>;
  onShowAuthDialog: () => void;
}

export function MediaSearch({ activeTab, refinementOptions, onShowAuthDialog }: MediaSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [prompt, setPrompt] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const { toast } = useToast();

  const handleSearch = async (searchPrompt: string, isRefinement = false) => {
    setIsLoading(true);
    const finalPrompt = isRefinement ? `${lastPrompt} ${searchPrompt}` : searchPrompt;
    console.log(`Searching for ${activeTab} with prompt:`, finalPrompt);
    
    try {
      let endpoint = 'search-movies';
      if (activeTab === 'anime') {
        endpoint = 'search-anime';
      } else if (activeTab === 'show') {
        endpoint = 'search-shows';
      }

      const { data, error } = await supabase.functions.invoke(endpoint, { 
        body: { prompt: finalPrompt } 
      });
      
      if (error) {
        console.error(`Error searching ${activeTab}:`, error);
        toast({
          title: "Error",
          description: `Failed to get ${activeTab} recommendations. Please try again.`,
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

      const filteredResults = data.movies.filter(movie => 
        !movie.genre?.some(g => g.toLowerCase() === 'hentai')
      );

      const sortedResults = [...filteredResults].sort((a, b) => {
        const aHasThemes = a.theme && a.theme.length > 0;
        const bHasThemes = b.theme && b.theme.length > 0;
        
        if (aHasThemes && !bHasThemes) return -1;
        if (!aHasThemes && bHasThemes) return 1;
        return 0;
      });

      setResults(sortedResults);
      setLastPrompt(finalPrompt);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    handleSearch(prompt);
  };

  const handleRefinement = (refinementPrompt: string) => {
    handleSearch(refinementPrompt, true);
  };

  const handleFeedback = (type: 'like' | 'dislike' | 'info', title: string) => {
    let feedbackPrompt = "";
    switch (type) {
      case 'like':
        feedbackPrompt = `more like ${title}`;
        break;
      case 'dislike':
        feedbackPrompt = `different from ${title}`;
        break;
      case 'info':
        feedbackPrompt = `similar to ${title} but with different themes`;
        break;
    }
    handleSearch(feedbackPrompt, true);
  };

  const handleSave = async (movie: Movie) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      onShowAuthDialog();
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
    <div className="space-y-6">
      <SearchSection
        activeTab={activeTab}
        prompt={prompt}
        isLoading={isLoading}
        onPromptChange={setPrompt}
        onSubmit={handleSubmit}
      />

      {results.length > 0 && (
        <RefinementOptions
          options={refinementOptions}
          onRefinement={handleRefinement}
        />
      )}

      <MovieResults 
        isLoading={isLoading}
        results={results}
        onSaveMovie={handleSave}
        onFeedback={handleFeedback}
      />
    </div>
  );
}