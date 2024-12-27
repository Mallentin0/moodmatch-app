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
        return "Discover Your Next Favorite Movie";
      case 'anime':
        return "Find Your Perfect Anime";
      case 'tvshow':
        return "Discover Binge-Worthy Shows";
      default:
        return "What would you like to watch?";
    }
  };

  const getDescription = () => {
    switch (activeTab) {
      case 'movie':
        return "Tell us your mood or interests, and we'll find the perfect movie match for you.";
      case 'anime':
        return "Describe what kind of anime you're in the mood for, and we'll find your next obsession.";
      case 'tvshow':
        return "Looking for a new series? Tell us what you enjoy, and we'll find your next binge-worthy show.";
      default:
        return "Tell us what you want to watch.";
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'movie':
        return "E.g., 'An inspiring sci-fi adventure with mind-bending plot twists'";
      case 'anime':
        return "E.g., 'A fantasy adventure with strong character development'";
      case 'tvshow':
        return "E.g., 'A gripping crime drama with complex characters'";
      default:
        return "Enter your search...";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/90 shadow-xl border-primary/20 animate-float backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {getTitle()}
        </CardTitle>
        <CardDescription className="text-muted-foreground max-w-lg mx-auto text-base">
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex space-x-2 max-w-2xl mx-auto">
          <Input
            placeholder={getPlaceholder()}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="flex-grow bg-background/50 text-foreground placeholder-muted-foreground/70 border-primary/20 focus:border-primary focus:ring-primary backdrop-blur-sm"
          />
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Finding...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Discover
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}