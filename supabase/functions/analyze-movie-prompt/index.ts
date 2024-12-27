import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function analyzePrompt(prompt: string) {
  const analysis = {
    genres: [] as string[],
    mood: [] as string[],
    period: null as string | null,
    streaming: null as string | null,
  };

  // Genre analysis
  const genreKeywords = {
    'comedy': ['funny', 'comedy', 'humorous', 'laugh'],
    'drama': ['dramatic', 'drama', 'emotional', 'serious'],
    'action': ['action', 'exciting', 'thriller', 'adventure'],
    'romance': ['romantic', 'romance', 'love'],
    'horror': ['horror', 'scary', 'spooky', 'thriller'],
    'sci-fi': ['sci-fi', 'science fiction', 'futuristic', 'space'],
  };

  // Mood analysis
  const moodKeywords = {
    'uplifting': ['uplifting', 'feel-good', 'inspiring', 'positive'],
    'dark': ['dark', 'gritty', 'intense', 'serious'],
    'nostalgic': ['nostalgic', 'classic', 'retro'],
    'thought-provoking': ['thought-provoking', 'deep', 'philosophical'],
  };

  // Time period analysis
  const periodKeywords = {
    '90s': ['90s', '1990s', 'nineties'],
    '80s': ['80s', '1980s', 'eighties'],
    '70s': ['70s', '1970s', 'seventies'],
    'modern': ['modern', 'recent', 'new', 'latest'],
    'classic': ['classic', 'old', 'vintage'],
  };

  // Streaming service analysis
  const streamingKeywords = {
    'netflix': ['netflix'],
    'amazon': ['amazon', 'prime'],
    'disney': ['disney'],
    'hulu': ['hulu'],
  };

  const promptLower = prompt.toLowerCase();

  // Analyze genres
  Object.entries(genreKeywords).forEach(([genre, keywords]) => {
    if (keywords.some(keyword => promptLower.includes(keyword))) {
      analysis.genres.push(genre);
    }
  });

  // Analyze mood
  Object.entries(moodKeywords).forEach(([mood, keywords]) => {
    if (keywords.some(keyword => promptLower.includes(keyword))) {
      analysis.mood.push(mood);
    }
  });

  // Analyze period
  Object.entries(periodKeywords).forEach(([period, keywords]) => {
    if (keywords.some(keyword => promptLower.includes(keyword))) {
      analysis.period = period;
    }
  });

  // Analyze streaming service
  Object.entries(streamingKeywords).forEach(([service, keywords]) => {
    if (keywords.some(keyword => promptLower.includes(keyword))) {
      analysis.streaming = service;
    }
  });

  return analysis;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    console.log('Analyzing prompt:', prompt);

    const analysis = analyzePrompt(prompt);
    console.log('Analysis results:', analysis);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-movie-prompt function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});