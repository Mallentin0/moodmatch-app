import { useState } from "react";
import { SearchSection } from "./SearchSection";
import { MovieResults } from "./MovieResults";
import { searchTVShows, TVShow } from "@/utils/tvmaze";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function TVShowsTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  const handleSearch = async (searchPrompt: string) => {
    if (!searchPrompt.trim()) return;
    
    setIsLoading(true);
    try {
      // First, analyze the prompt with Claude
      const { data: claudeData, error: claudeError } = await supabase.functions.invoke(
        'analyze-tv-prompt',
        { body: { prompt: searchPrompt } }
      );
      
      if (claudeError) throw claudeError;

      // Use the analyzed keywords to search for shows
      const searchTerms = claudeData.keywords || [searchPrompt];
      let allShows: TVShow[] = [];

      // Search for each keyword
      for (const term of searchTerms) {
        const shows = await searchTVShows(term);
        allShows = [...allShows, ...shows];
      }

      // Remove duplicates and format the results
      const uniqueShows = Array.from(new Map(allShows.map(show => [show.id, show])).values());
      const formattedShows = uniqueShows.map((show: TVShow) => ({
        title: show.name,
        year: show.premiered?.split('-')[0] || 'Unknown',
        poster: show.image?.original || show.image?.medium || '/placeholder.svg',
        synopsis: show.summary ? show.summary.replace(/<[^>]*>/g, '') : 'No description available',
        genre: show.genres || [],
        type: 'show' as const,
        streaming: show.network ? [show.network.name] : [],
        tone: claudeData.tones || [],
        theme: claudeData.themes || []
      }));
      
      setResults(formattedShows.slice(0, 6)); // Limit to 6 results like movies
    } catch (error) {
      console.error('Error searching shows:', error);
      toast({
        title: "Error",
        description: "Failed to fetch TV shows. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(prompt);
  };

  const handleFeedback = async (type: 'like' | 'dislike' | 'info', title: string) => {
    let searchPrompt = "";
    
    switch (type) {
      case 'like':
        searchPrompt = `shows similar to ${title} with similar themes and tone`;
        toast({
          title: "Finding similar shows",
          description: `Looking for more shows like ${title}`,
        });
        break;
      case 'dislike':
        searchPrompt = `shows different from ${title}, with different themes and genres`;
        toast({
          title: "Updating recommendations",
          description: `Finding different shows from ${title}`,
        });
        break;
      case 'info':
        // Find the show in results to display more info
        const show = results.find(s => s.title === title);
        if (show) {
          toast({
            title: show.title,
            description: `${show.synopsis}\n\nGenres: ${show.genre.join(', ')}\nNetwork: ${show.streaming.join(', ')}\nThemes: ${show.theme.join(', ')}\nTone: ${show.tone.join(', ')}`,
            duration: 10000,
          });
        }
        return;
    }

    if (searchPrompt) {
      await handleSearch(searchPrompt);
    }
  };

  return (
    <>
      <SearchSection
        activeTab="tvshow"
        prompt={prompt}
        isLoading={isLoading}
        onPromptChange={setPrompt}
        onSubmit={handleSubmit}
      />

      <MovieResults 
        isLoading={isLoading}
        results={results}
        onFeedback={handleFeedback}
      />
    </>
  );
}