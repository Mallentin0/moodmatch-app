import { MediaType } from "@/types/media";
import { SearchSection } from "./SearchSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MediaTabsProps {
  activeTab: MediaType;
  onTabChange: (value: string) => void;
  prompt: string;
  isLoading: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function MediaTabs({
  activeTab,
  onTabChange,
  prompt,
  isLoading,
  onPromptChange,
  onSubmit
}: MediaTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
        <TabsTrigger value="movie">Movies</TabsTrigger>
        <TabsTrigger value="show">Shows</TabsTrigger>
        <TabsTrigger value="anime">Anime</TabsTrigger>
      </TabsList>

      {(['movie', 'show', 'anime'] as MediaType[]).map((type) => (
        <TabsContent key={type} value={type}>
          <SearchSection
            activeTab={type}
            prompt={prompt}
            isLoading={isLoading}
            onPromptChange={onPromptChange}
            onSubmit={onSubmit}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}