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
        return "Tell us what you're in the mood for, and we'll find the perfect movie match.";
      case 'anime':
        return "Describe your ideal anime experience, and we'll curate the perfect selection.";
      case 'tvshow':
        return "Share your interests, and we'll recommend your next binge-worthy series.";
      default:
        return "Let us help you find your next favorite.";
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'movie':
        return "e.g., 'An inspiring sci-fi adventure'";
      case 'anime':
        return "e.g., 'A fantasy with strong characters'";
      case 'tvshow':
        return "e.g., 'A gripping crime drama'";
      default:
        return "What would you like to watch?";
    }
  };

  return (
    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-background/50 to-background/80 backdrop-blur-xl">
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
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <Input
            placeholder={getPlaceholder()}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="h-12 bg-background/50 border-primary/20 focus:border-primary focus:ring-primary backdrop-blur-sm text-sm sm:text-base flex-1"
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
        </form>
      </CardContent>
    </Card>
  );
}