import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzePrompt } from "../search-movies/claude.ts";

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');

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
    console.log('Received show search prompt:', prompt);

    // Use Claude to analyze the prompt
    const searchParams = await analyzePrompt(prompt);
    console.log('Parsed search parameters:', searchParams);

    // Search TV shows using TMDB API
    const searchUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_null_first_air_dates=false&with_keywords=${encodeURIComponent(searchParams.keywords.join(','))}&page=1`;
    console.log('TMDB API URL:', searchUrl);

    const response = await fetch(searchUrl);
    const data = await response.json();

    // Transform the results to match our format
    const shows = await Promise.all(data.results.slice(0, 6).map(async (show: any) => {
      // Get additional show details including streaming providers
      const detailsUrl = `https://api.themoviedb.org/3/tv/${show.id}?api_key=${TMDB_API_KEY}&append_to_response=watch/providers`;
      const detailsResponse = await fetch(detailsUrl);
      const details = await detailsResponse.json();

      // Extract streaming platforms from watch providers
      const streamingPlatforms = details['watch/providers']?.results?.US?.flatrate?.map((provider: any) => provider.provider_name) || [];

      return {
        title: show.name,
        year: show.first_air_date?.split('-')[0] || 'N/A',
        poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        synopsis: show.overview,
        streaming: streamingPlatforms,
        genre: details.genres?.map((g: any) => g.name) || [],
        tone: searchParams.tone || [],
        theme: searchParams.theme || [],
        type: 'show',
        ratings: [{
          source: 'TMDB',
          value: `${show.vote_average}/10`
        }],
        runtime: `${details.number_of_episodes || '?'} episodes`,
        director: details.created_by?.[0]?.name || 'Unknown'
      };
    }));

    console.log('Processed show results:', shows);

    return new Response(
      JSON.stringify({ movies: shows }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-shows function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get show recommendations' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});