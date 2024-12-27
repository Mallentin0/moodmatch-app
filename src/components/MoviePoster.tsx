import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";

// Add type definition for Ko-fi widget
declare global {
  interface Window {
    kofiWidgetOverlay?: {
      draw: (username: string, options: Record<string, string>) => void;
    };
  }
}

interface MoviePosterProps {
  poster: string;
  title: string;
  onSave?: () => void;
}

export function MoviePoster({ poster, title, onSave }: MoviePosterProps) {
  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from firing
    if (window.kofiWidgetOverlay) {
      window.kofiWidgetOverlay.draw('moodwatch', {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Support me',
        'floating-chat.donateButton.background-color': '#ff5f5f',
        'floating-chat.donateButton.text-color': '#fff'
      });
    }
  };

  return (
    <div className="relative aspect-[2/3] overflow-hidden">
      <img
        src={poster || "/placeholder.svg"}
        alt={title}
        className="object-cover w-full h-full"
      />
      <Button
        variant="secondary"
        size="sm"
        className="absolute top-2 right-2"
        onClick={handleSaveClick}
      >
        <BookmarkPlus className="w-4 h-4 mr-2" />
        Save
      </Button>
    </div>
  );
}