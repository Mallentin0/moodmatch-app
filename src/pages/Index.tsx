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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Movie {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  theme?: string[];
  genre?: string[];
  tone?: string[];
  type?: 'movie' | 'show';
}

const REFINEMENT_OPTIONS = {
  movie: [
    { label: "More like this", prompt: "similar to the current recommendations" },
    { label: "Funnier", prompt: "but funnier" },
    { label: "More action", prompt: "with more action" },
    { label: "More dramatic", prompt: "but more dramatic" },
    { label: "More romantic", prompt: "with more romance" },
  ],
  anime: [
    { label: "More like this", prompt: "similar anime" },
    { label: "More action", prompt: "more action anime" },
    { label: "More dramatic", prompt: "more dramatic anime" },
    { label: "More romantic", prompt: "more romantic anime" },
    { label: "More fantasy", prompt: "more fantasy anime" },
  ]
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<'movie' | 'anime'>('movie');
  const { toast } = useToast();

  const handleSearch = async (searchPrompt: string, isRefinement = false) => {
    setIsLoading(true);
    const finalPrompt = isRefinement ? `${lastPrompt} ${searchPrompt}` : searchPrompt;
    console.log(`Searching for ${activeTab} with prompt:`, finalPrompt);
    
    try {
      const { data, error } = await supabase.functions.invoke(
        activeTab === 'movie' ? 'search-movies' : 'search-anime', 
        { body: { prompt: finalPrompt } }
      );
      
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

      const sortedResults = [...data.movies].sort((a, b) => {
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

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'movie' | 'anime');
    setResults([]);
    setLastPrompt("");
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="movie">Movies</TabsTrigger>
            <TabsTrigger value="anime">Anime</TabsTrigger>
          </TabsList>

          <TabsContent value="movie">
            <Card className="bg-card shadow-lg border-primary/20 animate-float">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-primary">What's your movie mood today?</CardTitle>
                <CardDescription className="text-muted-foreground max-w-lg mx-auto">
                  Describe the type of movie you're looking for, and we'll find the perfect match.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex space-x-2 max-w-2xl mx-auto">
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
          </TabsContent>

          <TabsContent value="anime">
            <Card className="bg-card shadow-lg border-primary/20 animate-float">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-primary">What anime are you in the mood for?</CardTitle>
                <CardDescription className="text-muted-foreground max-w-lg mx-auto">
                  Tell us what kind of anime you want to watch, and we'll find the perfect series.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex space-x-2 max-w-2xl mx-auto">
                  <Input
                    placeholder="E.g., 'A fantasy adventure with strong characters'"
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
          </TabsContent>
        </Tabs>

        {results.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center py-4 px-6 bg-card/50 rounded-lg backdrop-blur-sm border border-primary/10 shadow-lg animate-fade-in">
            {REFINEMENT_OPTIONS[activeTab].map((option) => (
              <Badge
                key={option.label}
                variant="secondary"
                className="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-primary/20 hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                onClick={() => handleRefinement(option.prompt)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        )}

        <MovieResults 
          isLoading={isLoading}
          results={results}
          onSaveMovie={handleSave}
          onFeedback={handleFeedback}
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