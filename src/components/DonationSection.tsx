import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import { Button } from "./ui/button";

export function DonationSection() {
  const handleDonateClick = () => {
    // This will trigger the Ko-fi widget that's already set up in index.html
    if (window.kofiWidgetOverlay) {
      window.kofiWidgetOverlay.draw('moodwatch', {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Support me',
        'floating-chat.donateButton.background-color': '#ff5f5f',
        'floating-chat.donateButton.text-color': '#fff'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center my-8 p-6 rounded-lg bg-secondary/30"
    >
      <h2 className="text-2xl font-semibold mb-3">Support MoodMatch</h2>
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
        Help us continue improving MoodMatch with new features and better recommendations.
        Your support makes a difference!
      </p>
      <Button
        onClick={handleDonateClick}
        className="bg-[#ff5f5f] hover:bg-[#ff4f4f] text-white"
      >
        <Coffee className="mr-2 h-4 w-4" />
        Buy me a coffee
      </Button>
    </motion.div>
  );
}