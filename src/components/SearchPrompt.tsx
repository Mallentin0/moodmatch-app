import { useState } from "react";
import { Search } from "lucide-react";

interface SearchPromptProps {
  onSearch: (prompt: string) => void;
  isLoading?: boolean;
}

export const SearchPrompt = ({ onSearch, isLoading = false }: SearchPromptProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSearch(prompt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200" />
        <div className="relative glass-card rounded-lg p-2">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to watch..."
              className="flex-1 bg-transparent border-none outline-none placeholder:text-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        Try "A funny romantic comedy from the 90s" or "Dark sci-fi thriller on Netflix"
      </p>
    </form>
  );
};