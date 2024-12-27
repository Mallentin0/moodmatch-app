import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface HeaderProps {
  onSignInClick: () => void;
}

export function Header({ onSignInClick }: HeaderProps) {
  return (
    <>
      <div className="flex justify-end mb-4 sm:mb-8 px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={onSignInClick}
          className="flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12 px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">MoodMatch</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
          Describe how you feel and your mood and we'll use AI to find the perfect match.
        </p>
      </motion.div>
    </>
  );
}