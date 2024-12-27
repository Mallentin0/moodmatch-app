import { useState } from "react";
import { SearchSection } from "./SearchSection";
import { MovieResults } from "./MovieResults";
import { searchTVShows, TVShow } from "@/utils/tvmaze";
import { useToast } from "./ui/use-toast";

export function TVShowsTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  const handleSearch = async (searchPrompt: string) => {
    if (!searchPrompt.trim()) return;
    
    setIsLoading(true);
    try {
      const shows = await searchTVShows(searchPrompt);
      const formattedShows = shows.map((show: TVShow) => ({
        title: show.name,
        year: show.premiered?.split('-')[0] || 'Unknown',
        poster: show.image?.original || show.image?.medium || '/placeholder.svg',
        synopsis: show.summary ? show.summary.replace(/<[^>]*>/g, '') : 'No description available',
        genre: show.genres || [],
        type: 'show' as const,
        streaming: show.network ? [show.network.name] : [],
        tone: [],
        theme: []
      }));
      
      setResults(formattedShows);
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
    toast({
      title: "Feature coming soon",
      description: "Show recommendations will be available soon!",
    });
  };

  const handleSave = async (show: any) => {
    toast({
      title: "Coming soon",
      description: "Saving TV shows will be available soon!",
    });
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
        onSaveMovie={handleSave}
        onFeedback={handleFeedback}
      />
    </>
  );
}