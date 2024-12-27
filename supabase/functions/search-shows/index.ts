import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzePrompt } from "../search-movies/claude.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    console.log('Received TV show search prompt:', prompt);

    // Use Claude to analyze the prompt
    const searchParams = await analyzePrompt(prompt);
    console.log('Claude analysis:', searchParams);

    // Build search query based on Claude's analysis
    const searchQuery = [
      searchParams.genre,
      ...searchParams.keywords,
      searchParams.mood,
      'tv series'
    ].filter(Boolean).join(' ');

    // Search TV shows using TMDB API
    const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
    const searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&page=1`;
    console.log('TMDB API URL:', searchUrl);

    const response = await fetch(searchUrl);
    const data = await response.json();

    // Transform the results to match our existing movie format
    const showResults = data.results.slice(0, 6).map((show: any) => ({
      title: show.name,
      year: show.first_air_date?.split('-')[0] || 'N/A',
      poster: show.poster_path 
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster',
      synopsis: show.overview || 'No synopsis available',
      streaming: [], // TMDB doesn't provide streaming info in basic search
      genre: [], // We'd need an additional API call to get genres
      tone: searchParams.mood ? [searchParams.mood] : [],
      theme: [],
      type: 'show' as const
    }));

    console.log('Processed TV show results:', showResults);

    return new Response(
      JSON.stringify({ movies: showResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-shows function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get TV show recommendations' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});