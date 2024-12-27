import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface MoviePosterProps {
  poster: string;
  title: string;
  className?: string;
}

export function MoviePoster({ poster, title, className }: MoviePosterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("relative aspect-[2/3] overflow-hidden rounded-lg", className)}
    >
      <img
        src={poster}
        alt={`${title} poster`}
        className="h-full w-full object-cover transition-all hover:scale-105"
      />
    </motion.div>
  );
}