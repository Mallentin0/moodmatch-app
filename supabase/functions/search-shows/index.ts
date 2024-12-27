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
    console.log('Parsed search parameters:', searchParams);

    // Search TV shows using TMDB API
    const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
    const searchUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&with_keywords=${encodeURIComponent(searchParams.keywords.join(','))}`;
    console.log('TMDB API URL:', searchUrl);

    const response = await fetch(searchUrl);
    const data = await response.json();

    // Transform the results to match our Media type format
    const showResults = await Promise.all(data.results.slice(0, 6).map(async (show: any) => {
      // Get additional show details
      const detailsUrl = `https://api.themoviedb.org/3/tv/${show.id}?api_key=${TMDB_API_KEY}&append_to_response=watch/providers`;
      const detailsResponse = await fetch(detailsUrl);
      const details = await detailsResponse.json();

      // Extract streaming providers (US region)
      const providers = details['watch/providers']?.results?.US?.flatrate || [];
      const streamingPlatforms = providers.map((p: any) => p.provider_name);

      return {
        title: show.name,
        year: show.first_air_date?.split('-')[0] || 'N/A',
        poster: show.poster_path 
          ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
          : 'https://via.placeholder.com/500x750?text=No+Poster',
        synopsis: show.overview || 'No synopsis available',
        streaming: streamingPlatforms,
        genre: details.genres?.map((g: any) => g.name) || [],
        tone: searchParams.tone || [],
        theme: searchParams.theme || [],
        type: 'show' as const,
        ratings: [{
          source: 'TMDB',
          value: `${Math.round(show.vote_average * 10) / 10}/10`
        }],
        runtime: `${details.number_of_seasons} season${details.number_of_seasons !== 1 ? 's' : ''}`,
        director: details.created_by?.[0]?.name || 'Unknown',
        actors: details.credits?.cast?.slice(0, 3).map((actor: any) => actor.name) || []
      };
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