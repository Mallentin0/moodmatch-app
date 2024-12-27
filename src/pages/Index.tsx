import { useState } from "react";
import { SearchPrompt } from "@/components/SearchPrompt";
import { Header } from "@/components/Header";
import { MovieResults } from "@/components/MovieResults";
import { supabase } from "@/integrations/supabase/client";
import { AuthDialog } from "@/components/AuthDialog";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    console.log("Searching with prompt:", prompt);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-movies', {
        body: { prompt }
      });
      
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
      setPrompt("");
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
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-gradient-to-r from-primary/20 via-background to-accent/20 p-6 shadow-lg animate-gradient">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">
            <span className="text-primary">Mood</span>Match
          </h1>
          <Button
            variant="outline"
            onClick={() => setShowAuthDialog(true)}
            className="border-primary/20 text-primary-foreground hover:bg-primary/20"
          >
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-grow flex flex-col p-6 space-y-6 overflow-hidden max-w-7xl mx-auto w-full">
        <Card className="bg-card shadow-lg border-primary/20 animate-float">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">What's your mood today?</CardTitle>
            <CardDescription className="text-muted-foreground">
              Describe your mood or the type of movie/show you're looking for, and we'll find the perfect match.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex space-x-2">
              <Input
                placeholder="E.g., 'A mind-bending sci-fi thriller'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-grow bg-secondary text-secondary-foreground placeholder-muted-foreground border-primary/20 focus:border-primary focus:ring-primary"
              />
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                <Search className="mr-2 h-4 w-4" /> 
                {isLoading ? "Searching..." : "Discover"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <MovieResults 
          isLoading={isLoading}
          results={results}
          onSaveMovie={handleSave}
        />
      </main>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </div>
  );
};

export default Index;