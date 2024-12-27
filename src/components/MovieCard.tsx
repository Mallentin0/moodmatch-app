import { motion } from "framer-motion";
import { Star, Award, User2, Trophy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface MovieCardProps {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  ratings?: { Source: string; Value: string }[];
  director?: string;
  actors?: string;
  awards?: string;
}

export const MovieCard = ({
  title,
  year,
  poster,
  synopsis,
  streaming = [],
  ratings = [],
  director,
  actors,
  awards,
}: MovieCardProps) => {
  const imdbRating = ratings.find((r) => r.Source === "Internet Movie Database")?.Value;
  const rtRating = ratings.find((r) => r.Source === "Rotten Tomatoes")?.Value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card rounded-lg overflow-hidden"
    >
      <div className="aspect-[2/3] relative">
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/photo-1526374965328-7f61d4dc18c5";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {(imdbRating || rtRating) && (
          <div className="absolute top-2 right-2 flex gap-2">
            {imdbRating && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="bg-yellow-400 text-black px-2 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {imdbRating}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>IMDb Rating</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {rtRating && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="bg-red-600 text-white px-2 py-1 rounded-md text-sm font-semibold">
                      {rtRating}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rotten Tomatoes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">{year}</p>
        <p className="text-sm line-clamp-3 text-gray-600 mb-4">{synopsis}</p>
        
        <div className="space-y-2">
          {director && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User2 className="w-4 h-4" />
              <span>{director}</span>
            </div>
          )}
          {actors && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award className="w-4 h-4" />
              <span className="line-clamp-1">{actors}</span>
            </div>
          )}
          {awards && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Trophy className="w-4 h-4" />
              <span className="line-clamp-1">{awards}</span>
            </div>
          )}
        </div>

        {streaming.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {streaming.map((platform) => (
              <span
                key={platform}
                className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600"
              >
                {platform}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};