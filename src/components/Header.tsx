import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface HeaderProps {
  onSignInClick: () => void;
}

export function Header({ onSignInClick }: HeaderProps) {
  const handleKofiClick = () => {
    // @ts-ignore - kofiWidgetOverlay is added by the script
    if (window.kofiWidgetOverlay) {
      // @ts-ignore
      window.kofiWidgetOverlay.draw('moodwatch', {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Support me',
        'floating-chat.donateButton.background-color': '#ff5f5f',
        'floating-chat.donateButton.text-color': '#fff'
      });
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4 sm:mb-8 px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={handleKofiClick}
          className="flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign in
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