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

    // Search for movies
    const movieSearchUrl = buildSearchUrl(searchParams, 1, 'movie');
    const movieResults = await searchMovies(movieSearchUrl);
    let movies = await Promise.all(
      movieResults.results.slice(0, 3).map(async (movie: any) => {
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

    // Search for TV shows
    const showSearchUrl = buildSearchUrl(searchParams, 1, 'tv');
    const showResults = await searchMovies(showSearchUrl);
    let shows = await Promise.all(
      showResults.results.slice(0, 3).map(async (show: any) => {
        const details = await fetchMovieDetails(show.id, 'tv');
        const enriched = await enrichWithOMDbData({
          title: details.name,
          year: details.first_air_date?.split('-')[0] || '',
          poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : '',
          synopsis: details.overview,
          genre: details.genres?.map((g: any) => g.name) || [],
          streaming: details.watch_providers?.results?.US?.flatrate?.map((p: any) => p.provider_name) || [],
          type: 'show'
        });
        return enriched;
      })
    );

    // Combine and shuffle results
    const allResults = [...movies, ...shows].sort(() => Math.random() - 0.5);
    console.log('Combined results:', allResults);

    return new Response(
      JSON.stringify({ movies: allResults }),
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