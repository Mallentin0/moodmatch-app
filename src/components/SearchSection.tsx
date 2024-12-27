import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  return (
    <Card className="bg-card/50 border-none shadow-lg backdrop-blur-sm">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold">
          Discover {activeTab === 'movie' ? 'Movies' : activeTab === 'tvshow' ? 'TV Shows' : 'Anime'}
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground/80">
          Tell us what you're in the mood for, and we'll find the perfect match.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <Input
            placeholder="e.g., 'An inspiring sci-fi adventure'"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="h-12 bg-background/50 border-primary/20 focus-visible:ring-primary text-base"
          />
          <Button 
            type="submit"
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-medium px-8 h-12"
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