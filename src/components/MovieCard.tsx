import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { getPlatformDisplayName } from "@/utils/platformUtils";

interface MovieCardProps {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
}

export const MovieCard = ({ title, year, poster, synopsis, streaming = [] }: MovieCardProps) => {
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
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Streaming platforms overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          {streaming.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {streaming.map((platform) => (
                <Badge
                  key={platform}
                  variant="secondary"
                  className="bg-black/60 backdrop-blur-sm text-white flex items-center gap-1"
                >
                  <Globe className="h-3 w-3" />
                  {getPlatformDisplayName(platform)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">{year}</p>
        <p className="text-sm line-clamp-3 text-gray-600">{synopsis}</p>
      </div>
    </motion.div>
  );
};