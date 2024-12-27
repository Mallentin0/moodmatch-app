import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface HeaderProps {
  onSignInClick: () => void;
}

export function Header({ onSignInClick }: HeaderProps) {
  return (
    <div className="relative">
      {/* Sign in button */}
      <div className="relative flex justify-end p-4">
        <Button
          variant="ghost"
          onClick={onSignInClick}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </div>

      {/* Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center mb-16 px-4 max-w-3xl mx-auto"
      >
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
          MoodMatch
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground/80 max-w-2xl mx-auto">
          Tell us what you're in the mood for, and we'll use AI to find the perfect movie or show for you.
        </p>
      </motion.div>
    </div>
  );
}