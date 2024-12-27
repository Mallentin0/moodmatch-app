import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const KofiButton = () => {
  const { toast } = useToast();

  return (
    <div className="flex justify-center my-6">
      <a 
        href="https://ko-fi.com/R6R4181VNL" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff5f5f] text-white rounded-md hover:bg-[#ff4f4f] transition-colors"
        onClick={(e) => {
          e.preventDefault();
          toast({
            title: "Feature Coming Soon!",
            description: (
              <div className="flex flex-col gap-2">
                <p>Save functionality is coming soon!</p>
                <a 
                  href="https://ko-fi.com/R6R4181VNL" 
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
        }}
      >
        <Heart className="w-4 h-4" />
        Support this project
      </a>
    </div>
  );
};