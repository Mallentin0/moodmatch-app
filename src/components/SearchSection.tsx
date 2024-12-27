import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";

interface SearchSectionProps {
  activeTab: 'movie' | 'anime' | 'tvshow';
  prompt: string;
  isLoading: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SearchSection({ 
  activeTab, 
  prompt, 
  isLoading, 
  onPromptChange, 
  onSubmit 
}: SearchSectionProps) {
  const getTitle = () => {
    switch (activeTab) {
      case 'movie':
        return "Discover Movies";
      case 'anime':
        return "Explore Anime";
      case 'tvshow':
        return "Find TV Shows";
      default:
        return "Discover Content";
    }
  };

  const getDescription = () => {
    switch (activeTab) {
      case 'movie':
        return "Tell us what kind of mood you're in, and we'll find the perfect movie match.";
      case 'anime':
        return "Share your current feelings, and we'll suggest the perfect anime.";
      case 'tvshow':
        return "Describe your emotional state, and we'll recommend the ideal TV series.";
      default:
        return "Let us help you find your next favorite.";
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'movie':
        return "e.g., 'I'm feeling happy and want something uplifting'";
      case 'anime':
        return "e.g., 'I need something exciting and action-packed'";
      case 'tvshow':
        return "e.g., 'I want to watch something relaxing and funny'";
      default:
        return "What would you like to watch?";
    }
  };

  const getInputLabel = () => {
    switch (activeTab) {
      case 'movie':
        return "How are you feeling? What kind of movie would match your mood?";
      case 'anime':
        return "What emotions or themes are you looking for in an anime?";
      case 'tvshow':
        return "What's your current mood? What kind of show would suit you?";
      default:
        return "Tell us what you'd like to watch";
    }
  };

  return (
    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-background/50 to-background/80 backdrop-blur-xl mx-auto max-w-4xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 pointer-events-none" />
      <CardHeader className="relative space-y-1 text-center pb-4 px-4 sm:px-6">
        <CardTitle className="text-2xl sm:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
          {getTitle()}
        </CardTitle>
        <CardDescription className="text-base sm:text-lg text-muted-foreground max-w-[42rem] mx-auto">
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative px-4 sm:px-6">
        <form onSubmit={onSubmit} className="space-y-4 max-w-2xl mx-auto">
          <div className="space-y-2">
            <label htmlFor="search-input" className="text-sm font-medium text-foreground/80 text-center block">
              {getInputLabel()}
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <Input
                id="search-input"
                placeholder={getPlaceholder()}
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                className="h-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary backdrop-blur-sm text-sm sm:text-base flex-1 text-center"
              />
              <Button 
                type="submit" 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 h-12 w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Finding
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}