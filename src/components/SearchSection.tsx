import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchSectionProps {
  activeTab: 'movie' | 'anime';
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
    <Card className="bg-card shadow-lg border-primary/20 animate-float">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">
          {activeTab === 'movie' 
            ? "What's your movie mood today?"
            : "What anime are you in the mood for?"
          }
        </CardTitle>
        <CardDescription className="text-muted-foreground max-w-lg mx-auto">
          {activeTab === 'movie'
            ? "Describe the type of movie you're looking for, and we'll find the perfect match."
            : "Tell us what kind of anime you want to watch, and we'll find the perfect series."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex space-x-2 max-w-2xl mx-auto">
          <Input
            placeholder={activeTab === 'movie' 
              ? "E.g., 'A mind-bending sci-fi thriller'" 
              : "E.g., 'A fantasy adventure with strong characters'"
            }
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
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
  );
}