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
    const { prompt, includeShows = true } = await req.json();
    console.log('Received search prompt:', prompt, 'Include shows:', includeShows);

    const searchParams = await analyzePrompt(prompt);
    console.log('Parsed search parameters:', searchParams);

    // Search for movies
    const movieSearchUrl = buildSearchUrl(searchParams, 1);
    const movieResults = await searchMovies(movieSearchUrl);
    let movies = await Promise.all(
      movieResults.results.slice(0, 3).map(async (movie: any) => {
        const details = await fetchMovieDetails(movie.id);
        return enrichWithOMDbData(details, 'movie');
      })
    );

    // If includeShows is true, also search for TV shows
    let shows: any[] = [];
    if (includeShows) {
      const showSearchUrl = buildSearchUrl({ ...searchParams, mediaType: 'tv' }, 1);
      const showResults = await searchMovies(showSearchUrl);
      shows = await Promise.all(
        showResults.results.slice(0, 3).map(async (show: any) => {
          const details = await fetchMovieDetails(show.id);
          return enrichWithOMDbData(details, 'show');
        })
      );
    }

    // Combine and shuffle results
    const allResults = [...movies, ...shows].sort(() => Math.random() - 0.5);

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