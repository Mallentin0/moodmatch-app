import { motion } from "framer-motion";

export function Header() {
  return (
    <>
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