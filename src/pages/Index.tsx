import { useState } from "react";
import { Header } from "@/components/Header";
import { AuthDialog } from "@/components/AuthDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaSearch } from "@/components/MediaSearch";
import { MediaType } from "@/types/media";

const REFINEMENT_OPTIONS = {
  movie: [
    { label: "More like this", prompt: "similar to the current recommendations" },
    { label: "Funnier", prompt: "but funnier" },
    { label: "More action", prompt: "with more action" },
    { label: "More dramatic", prompt: "but more dramatic" },
    { label: "More romantic", prompt: "with more romance" },
  ],
  show: [
    { label: "More like this", prompt: "similar TV shows" },
    { label: "More drama", prompt: "more dramatic TV shows" },
    { label: "More comedy", prompt: "funnier TV shows" },
    { label: "More action", prompt: "more action-packed TV shows" },
    { label: "More suspense", prompt: "more suspenseful TV shows" },
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
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<MediaType>('movie');

  const handleSignIn = () => {
    setShowAuthDialog(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as MediaType);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onSignInClick={handleSignIn} />

      <main className="flex-grow flex flex-col p-6 space-y-6 overflow-hidden max-w-7xl mx-auto w-full">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="movie">Movies</TabsTrigger>
            <TabsTrigger value="show">TV Shows</TabsTrigger>
            <TabsTrigger value="anime">Anime</TabsTrigger>
          </TabsList>

          {(['movie', 'show', 'anime'] as const).map((tab) => (
            <TabsContent key={tab} value={tab}>
              <MediaSearch
                activeTab={tab}
                refinementOptions={REFINEMENT_OPTIONS[tab]}
                onShowAuthDialog={() => setShowAuthDialog(true)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
      />
    </div>
  );
};

export default Index;