import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzePrompt } from "./claude.ts";
import { fetchMovieDetails, searchMovies, buildSearchUrl, type MovieResult } from "./tmdb.ts";

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
    console.log('Received prompt:', prompt);

    // Analyze prompt using Claude
    console.log('Calling Claude API...');
    const searchParams = await analyzePrompt(prompt);
    console.log('Parsed search parameters:', searchParams);

    // Get multiple random pages to increase variety
    const pages = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10) + 1);
    const allResults = [];
    
    // Fetch content from multiple pages
    for (const page of pages) {
      const searchUrl = buildSearchUrl(searchParams, page);
      console.log(`TMDB URL for page ${page}:`, searchUrl);
      
      const searchData = await searchMovies(searchUrl);
      
      if (searchData.results && Array.isArray(searchData.results)) {
        allResults.push(...searchData.results);
      }
    }

    // If no results found, return a specific error message
    if (allResults.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No results found",
          message: "Could you be more descriptive? Try adding details like genre, time period, or mood. For example: 'funny romantic movies from the 90s' or 'dark sci-fi shows on Netflix'",
          movies: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Using 200 to handle this gracefully on the frontend
        }
      );
    }

    // Shuffle and take initial results
    const shuffledResults = allResults
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);

    // Transform and filter the results
    const movies: MovieResult[] = await Promise.all(
      shuffledResults.map(async (movie: any) => {
        console.log('Processing movie:', movie.title || movie.name);
        const details = await fetchMovieDetails(movie.id);
        
        // Extract streaming providers (US region)
        const providers = details['watch/providers']?.results?.US?.flatrate || [];
        const movieStreamingPlatforms = providers.map((p: any) => p.provider_name);

        return {
          title: movie.title || movie.name,
          year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
          poster: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster',
          synopsis: movie.overview || 'No synopsis available',
          streaming: movieStreamingPlatforms,
          genre: details.genres?.map((g: any) => g.name) || [],
          tone: searchParams.tone || [],
          theme: searchParams.theme || []
        };
      })
    );

    // Filter out null results and take up to 6 movies
    const filteredMovies = movies.filter(movie => movie !== null).slice(0, 6);

    console.log('Final movies response:', filteredMovies);

    return new Response(
      JSON.stringify({ movies: filteredMovies }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-movies function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get movie recommendations',
        message: 'Please try being more specific in your search. For example: "action movies from 2020" or "romantic comedies on Netflix"',
        movies: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});