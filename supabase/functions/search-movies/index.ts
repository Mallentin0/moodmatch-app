import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzePrompt } from "./claude.ts";
import { fetchMovieDetails, searchMovies, buildSearchUrl } from "./tmdb.ts";
import { enrichWithOMDbData } from "./omdb.ts";

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
    console.log('Received search prompt:', prompt);

    const searchParams = await analyzePrompt(prompt);
    console.log('Parsed search parameters:', searchParams);

    const searchUrl = buildSearchUrl(searchParams, 1, 'movie');
    console.log('TMDB API URL:', searchUrl);

    const movieResults = await searchMovies(searchUrl);
    const movies = await Promise.all(
      movieResults.results.slice(0, 6).map(async (movie: any) => {
        const details = await fetchMovieDetails(movie.id, 'movie');
        const enriched = await enrichWithOMDbData({
          title: details.title,
          year: details.release_date?.split('-')[0] || '',
          poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : '',
          synopsis: details.overview,
          genre: details.genres?.map((g: any) => g.name) || [],
          streaming: details.watch_providers?.results?.US?.flatrate?.map((p: any) => p.provider_name) || [],
          type: 'movie'
        });
        return enriched;
      })
    );

    console.log('Processed movie results:', movies);

    return new Response(
      JSON.stringify({ movies }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-movies function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get recommendations' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});