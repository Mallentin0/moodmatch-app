import { useState } from "react";
import { SearchSection } from "./SearchSection";
import { MovieResults } from "./MovieResults";
import { useToast } from "./ui/use-toast";

interface AnimeResult {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  theme?: string[];
  genre?: string[];
  tone?: string[];
  type?: 'anime';
}

export function AnimeTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  const handleSearch = async (searchPrompt: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchPrompt)}&limit=6`);
      const data = await response.json();

      const animeResults = data.data.map((anime: any) => ({
        title: anime.title,
        year: anime.year?.toString() || 'N/A',
        poster: anime.images.jpg.large_image_url,
        synopsis: anime.synopsis || 'No synopsis available',
        streaming: anime.streaming || [],
        genre: anime.genres?.map((g: any) => g.name) || [],
        tone: [anime.rating?.replace('_', ' ') || 'Not rated'],
        theme: anime.themes?.map((t: any) => t.name) || [],
        type: 'anime'
      }));

      setResults(animeResults);
    } catch (error) {
      console.error('Error fetching anime:', error);
      toast({
        title: "Error",
        description: "Failed to fetch anime. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    handleSearch(prompt);
  };

  const handleFeedback = async (type: 'like' | 'dislike' | 'info', title: string) => {
    switch (type) {
      case 'like': {
        const show = results.find(s => s.title === title);
        if (show) {
          const genres = show.genre?.join(' ') || '';
          await handleSearch(genres);
          toast({
            title: "Finding similar anime",
            description: `Looking for more anime like ${title}`,
          });
        }
        break;
      }
      case 'dislike': {
        const show = results.find(s => s.title === title);
        if (show) {
          const excludedGenres = show.genre?.join(' ') || '';
          const response = await fetch('https://api.jikan.moe/v4/anime?order_by=popularity&sort=desc');
          const data = await response.json();
          const filteredResults = data.data
            .filter((anime: any) => {
              const animeGenres = anime.genres?.map((g: any) => g.name).join(' ') || '';
              return !excludedGenres.split(' ').some(genre => animeGenres.includes(genre));
            })
            .slice(0, 6);

          const animeResults = filteredResults.map((anime: any) => ({
            title: anime.title,
            year: anime.year?.toString() || 'N/A',
            poster: anime.images.jpg.large_image_url,
            synopsis: anime.synopsis || 'No synopsis available',
            streaming: anime.streaming || [],
            genre: anime.genres?.map((g: any) => g.name) || [],
            tone: [anime.rating?.replace('_', ' ') || 'Not rated'],
            theme: anime.themes?.map((t: any) => t.name) || [],
            type: 'anime'
          }));

          setResults(animeResults);
          toast({
            title: "Updating recommendations",
            description: `Finding different anime from ${title}`,
          });
        }
        break;
      }
      case 'info': {
        const show = results.find(s => s.title === title);
        if (show) {
          toast({
            title: show.title,
            description: `${show.synopsis}\n\nGenres: ${show.genre?.join(', ')}\nThemes: ${show.theme?.join(', ')}\nTone: ${show.tone?.join(', ')}`,
            duration: 10000,
          });
        }
        break;
      }
    }
  };

  const handleSave = async (anime: AnimeResult) => {
    toast({
      title: "Coming soon",
      description: "Saving anime recommendations will be available soon!",
    });
  };

  return (
    <div className="space-y-6">
      <SearchSection
        activeTab="anime"
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
    </div>
  );
}