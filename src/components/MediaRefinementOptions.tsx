import { MediaType } from "@/types/media";
import { RefinementOptions } from "./RefinementOptions";

const REFINEMENT_OPTIONS = {
  movie: [
    { label: "More like this", prompt: "similar to the current recommendations" },
    { label: "Funnier", prompt: "but funnier" },
    { label: "More action", prompt: "with more action" },
    { label: "More dramatic", prompt: "but more dramatic" },
    { label: "More romantic", prompt: "with more romance" },
  ],
  show: [
    { label: "More like this", prompt: "similar shows" },
    { label: "More comedy", prompt: "more comedy shows" },
    { label: "More drama", prompt: "more dramatic shows" },
    { label: "More action", prompt: "more action shows" },
    { label: "More mystery", prompt: "more mystery shows" },
  ],
  anime: [
    { label: "More like this", prompt: "similar anime" },
    { label: "More action", prompt: "more action anime" },
    { label: "More dramatic", prompt: "more dramatic anime" },
    { label: "More romantic", prompt: "more romantic anime" },
    { label: "More fantasy", prompt: "more fantasy anime" },
  ]
};

interface MediaRefinementOptionsProps {
  mediaType: MediaType;
  onRefinement: (prompt: string) => void;
  show: boolean;
}

export function MediaRefinementOptions({ mediaType, onRefinement, show }: MediaRefinementOptionsProps) {
  if (!show) return null;
  
  return (
    <RefinementOptions
      options={REFINEMENT_OPTIONS[mediaType]}
      onRefinement={onRefinement}
    />
  );
}