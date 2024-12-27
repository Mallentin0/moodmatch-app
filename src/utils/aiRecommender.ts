import { supabase } from "@/integrations/supabase/client";

export const analyzeUserPrompt = async (prompt: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-movie-prompt', {
      body: { prompt },
    });

    if (error) {
      console.error('Error calling analyze-movie-prompt:', error);
      throw error;
    }

    return data.analysis;
  } catch (error) {
    console.error('Error analyzing prompt:', error);
    throw error;
  }
};