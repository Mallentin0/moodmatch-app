import { Badge } from "@/components/ui/badge";

interface RefinementOptionsProps {
  options: Array<{ label: string; prompt: string }>;
  onRefinement: (prompt: string) => void;
}

export function RefinementOptions({ options, onRefinement }: RefinementOptionsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center py-4 px-6 bg-card/50 rounded-lg backdrop-blur-sm border border-primary/10 shadow-lg animate-fade-in">
      {options.map((option) => (
        <Badge
          key={option.label}
          variant="secondary"
          className="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-primary/20 hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
          onClick={() => onRefinement(option.prompt)}
        >
          {option.label}
        </Badge>
      ))}
    </div>
  );
}