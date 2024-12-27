import { useState } from "react";
import { SearchPrompt } from "@/components/SearchPrompt";
import { MovieCard } from "@/components/MovieCard";
import { LoadingState } from "@/components/LoadingState";
import { useToast } from "@/components/ui/use-toast";
import { Movie } from "@/utils/movieApi";
import { analyzeUserPrompt } from "@/utils/aiRecommender";
import { searchMovies, getMovieDetails, MovieSchema } from "@/utils/movieApi";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const { toast } = useToast();

  const handleSearch = async (prompt: string) => {
    try {
      setIsLoading(true);
      setResults([]);

      // Analyze user prompt with Claude
      const preferences = await analyzeUserPrompt(prompt);
      console.log("AI Analysis:", preferences);

      // Search movies based on preferences
      const searchResults = await searchMovies(prompt);
      const topResults = searchResults.slice(0, 5);

      // Get detailed information for each movie
      const detailedResults = await Promise.all(
        topResults.map(async (movie: any) => {
          const details = await getMovieDetails(movie.id);
          return MovieSchema.parse({
            title: movie.title || "Untitled",
            year: movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "Unknown",
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.svg",
            synopsis: movie.overview || "No synopsis available",
            streaming: details.watch?.providers?.results?.US?.flatrate?.map((p: any) => p.provider_name) || [],
            ratings: details.ratings || [],
            director: details.director,
            actors: details.actors,
            awards: details.awards,
          });
        })
      );

      setResults(detailedResults);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">MoodMatch</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tell us what you're in the mood for, and we'll find the perfect movie or show for you.
          </p>
        </div>

        <SearchPrompt onSearch={handleSearch} isLoading={isLoading} />

        {isLoading ? (
          <LoadingState />
        ) : (
          results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {results.map((movie) => (
                <MovieCard
                  key={movie.title}
                  title={movie.title}
                  year={movie.year}
                  poster={movie.poster}
                  synopsis={movie.synopsis}
                  streaming={movie.streaming}
                  ratings={movie.ratings}
                  director={movie.director}
                  actors={movie.actors}
                  awards={movie.awards}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Index;