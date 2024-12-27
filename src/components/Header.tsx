import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogIn, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onSignInClick: () => void;
}

export function Header({ onSignInClick }: HeaderProps) {
  const { toast } = useToast();

  const handleSignInClick = () => {
    toast({
      title: "Feature Coming Soon!",
      description: (
        <div className="flex flex-col gap-2">
          <p>Sign in functionality is coming soon!</p>
          <a 
            href="https://ko-fi.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Heart className="w-4 h-4" />
            Support this project
          </a>
        </div>
      ),
      duration: 5000,
    });
  };

  return (
    <>
      <div className="flex justify-end mb-4 sm:mb-8 px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={handleSignInClick}
          className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border-primary/20"
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
          Describe your mood and how you're feeling, and let AI find the perfect match for you!
        </p>
      </motion.div>
    </>
  );
}