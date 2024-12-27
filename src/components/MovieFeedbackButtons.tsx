import { ThumbsUp, ThumbsDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, Tv } from "lucide-react";

interface MovieFeedbackButtonsProps {
  type?: 'movie' | 'show' | 'anime';
  onFeedback?: (type: 'like' | 'dislike' | 'info', e: React.MouseEvent) => void;
}

export function MovieFeedbackButtons({ type = 'movie', onFeedback }: MovieFeedbackButtonsProps) {
  return (
    <div className="flex justify-between items-center pt-4 border-t border-primary/20">
      <Badge 
        variant="secondary" 
        className="flex items-center space-x-1 bg-primary/10 text-primary"
      >
        {type === 'movie' ? (
          <Film className="h-3 w-3 mr-1" />
        ) : type === 'show' ? (
          <Tv className="h-3 w-3 mr-1" />
        ) : (
          <Film className="h-3 w-3 mr-1" />
        )}
        <span className="capitalize">{type}</span>
      </Badge>
      
      <div className="flex space-x-2">
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-primary hover:text-primary hover:bg-primary/20"
          onClick={(e) => onFeedback?.('like', e)}
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-destructive hover:text-destructive hover:bg-destructive/20"
          onClick={(e) => onFeedback?.('dislike', e)}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={(e) => onFeedback?.('info', e)}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}