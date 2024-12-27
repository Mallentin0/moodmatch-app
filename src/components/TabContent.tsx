import { Movie } from "@/types/movie";
import { MovieResults } from "./MovieResults";
import { RefinementOptions } from "./RefinementOptions";
import { SearchSection } from "./SearchSection";

interface TabContentProps {
  activeTab: 'movie' | 'anime' | 'tvshow';
  prompt: string;
  isLoading: boolean;
  results: Movie[];
  onPromptChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onRefinement: (prompt: string) => void;
  onSaveMovie: (movie: Movie) => void;
  onFeedback: (type: 'like' | 'dislike' | 'info', title: string) => void;
}

export function TabContent({
  activeTab,
  prompt,
  isLoading,
  results,
  onPromptChange,
  onSubmit,
  onRefinement,
  onSaveMovie,
  onFeedback
}: TabContentProps) {
  const REFINEMENT_OPTIONS = {
    movie: [
      { label: "More like this", prompt: "similar to the current recommendations" },
      { label: "Funnier", prompt: "but funnier" },
      { label: "More action", prompt: "with more action" },
      { label: "More dramatic", prompt: "but more dramatic" },
      { label: "More romantic", prompt: "with more romance" },
    ]
  };

  if (activeTab !== 'movie') return null;

  return (
    <>
      <SearchSection
        activeTab="movie"
        prompt={prompt}
        isLoading={isLoading}
        onPromptChange={onPromptChange}
        onSubmit={onSubmit}
      />
      {results.length > 0 && (
        <RefinementOptions
          options={REFINEMENT_OPTIONS.movie}
          onRefinement={onRefinement}
        />
      )}
      <MovieResults 
        isLoading={isLoading}
        results={results}
        onSaveMovie={onSaveMovie}
        onFeedback={onFeedback}
      />
    </>
  );
}