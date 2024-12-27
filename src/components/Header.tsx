import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface HeaderProps {
  onSignInClick: () => void;
}

export function Header({ onSignInClick }: HeaderProps) {
  return (
    <div className="relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/0 pointer-events-none" />
      
      {/* Sign in button */}
      <div className="relative flex justify-end mb-4 sm:mb-8 px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={onSignInClick}
          className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </div>

      {/* Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center mb-12 sm:mb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          MoodMatch
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Tell us what you're in the mood for, and we'll use AI to find the perfect movie or show for you.
        </p>
      </motion.div>

      {/* Tabs wrapper with gradient background */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/2 to-transparent pointer-events-none" />
        <div className="relative max-w-md mx-auto px-4">
          <div className="glass-card rounded-lg p-1">
            <nav className="flex rounded-md overflow-hidden">
              {["Movies", "TV Shows", "Anime"].map((tab, index) => (
                <button
                  key={tab}
                  className={`flex-1 py-3 px-4 text-sm sm:text-base font-medium transition-colors
                    ${index === 0 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}