import { useState } from "react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { AuthDialog } from "@/components/AuthDialog";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TVShowsTab } from "@/components/TVShowsTab";
import { AnimeTab } from "@/components/AnimeTab";
import { Footer } from "@/components/Footer";
import { TabContent } from "@/components/TabContent";
import { DonationSection } from "@/components/DonationSection";
import { Movie } from "@/types/movie";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'movie' | 'anime' | 'tvshow'>('movie');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [prompt, setPrompt] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const { toast } = useToast();

  const handleSignIn = () => {
    setShowAuthDialog(true);
  };

  const handleSearch = async (searchPrompt: string, isRefinement = false) => {
    setIsLoading(true);
    const finalPrompt = isRefinement ? `${lastPrompt} ${searchPrompt}` : searchPrompt;
    
    try {
      const { data, error } = await supabase.functions.invoke(
        'search-movies',
        { body: { prompt: finalPrompt } }
      );
      
      if (error) throw error;

      if (!data?.movies || !Array.isArray(data.movies)) {
        throw new Error('Invalid response format');
      }

      setResults(data.movies);
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

  const handleFeedback = async (type: 'like' | 'dislike' | 'info', title: string) => {
    let feedbackPrompt = "";
    switch (type) {
      case 'like':
        feedbackPrompt = `more movies similar to ${title}`;
        toast({
          title: "Finding similar movies",
          description: `Looking for more movies like ${title}`,
        });
        break;
      case 'dislike':
        feedbackPrompt = `different movies from ${title}, excluding similar themes and genres`;
        toast({
          title: "Updating recommendations",
          description: `Finding different movies from ${title}`,
        });
        break;
      case 'info':
        feedbackPrompt = `similar to ${title} but with different themes`;
        break;
    }
    await handleSearch(feedbackPrompt, true);
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
    setActiveTab(value as 'movie' | 'anime' | 'tvshow');
    setResults([]);
    setLastPrompt("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onSignInClick={handleSignIn} />

      <main className="flex-grow flex flex-col px-4 sm:px-6 lg:px-8 space-y-6 overflow-hidden max-w-7xl mx-auto w-full pb-24">
        <DonationSection />
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex justify-center w-full mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-secondary">
              <TabsTrigger 
                value="movie" 
                className="text-sm sm:text-base data-[state=active]:bg-[#EB3361] data-[state=active]:text-white"
              >
                Movies
              </TabsTrigger>
              <TabsTrigger 
                value="tvshow" 
                className="text-sm sm:text-base data-[state=active]:bg-[#EB3361] data-[state=active]:text-white"
              >
                TV Shows
              </TabsTrigger>
              <TabsTrigger 
                value="anime" 
                className="text-sm sm:text-base data-[state=active]:bg-[#EB3361] data-[state=active]:text-white"
              >
                Anime
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="movie" className="mt-6">
            <TabContent
              activeTab={activeTab}
              prompt={prompt}
              isLoading={isLoading}
              results={results}
              onPromptChange={setPrompt}
              onSubmit={handleSubmit}
              onRefinement={handleRefinement}
              onSaveMovie={handleSave}
              onFeedback={handleFeedback}
            />
          </TabsContent>

          <TabsContent value="tvshow">
            <TVShowsTab />
          </TabsContent>

          <TabsContent value="anime">
            <AnimeTab />
          </TabsContent>
        </Tabs>
      </main>

      <div className="mt-auto">
        <Footer />
      </div>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </div>
  );
};

export default Index;