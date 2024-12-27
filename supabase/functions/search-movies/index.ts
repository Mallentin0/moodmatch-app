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
    
    // Fetch movies from multiple pages
    for (const page of pages) {
      const searchUrl = buildSearchUrl(searchParams, page);
      console.log(`TMDB URL for page ${page}:`, searchUrl);
      
      const searchData = await searchMovies(searchUrl);
      
      if (searchData.results && Array.isArray(searchData.results)) {
        allResults.push(...searchData.results);
      }
    }

    // If no results found, try a broader search
    if (allResults.length === 0) {
      console.log('No results found, trying broader search...');
      const fallbackUrl = buildSearchUrl({}, Math.floor(Math.random() * 5) + 1);
      const fallbackData = await searchMovies(fallbackUrl);
      allResults.push(...fallbackData.results);
    }

    // Shuffle and take 6 random results
    const shuffledResults = allResults
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    // Transform the results
    const movies: MovieResult[] = await Promise.all(
      shuffledResults.map(async (movie: any) => {
        console.log('Processing movie:', movie.title);
        const details = await fetchMovieDetails(movie.id);
        
        // Extract streaming providers (US region)
        const providers = details['watch/providers']?.results?.US?.flatrate || [];
        
        // Filter streaming providers if specific platforms were requested
        const streamingProviders = searchParams.streaming?.length > 0
          ? providers.filter((p: any) => 
              searchParams.streaming.some((requested: string) => 
                p.provider_name.toLowerCase().includes(requested.toLowerCase())
              )
            )
          : providers;
        
        return {
          title: movie.title,
          year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
          poster: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster',
          synopsis: movie.overview || 'No synopsis available',
          streaming: streamingProviders.map((provider: any) => provider.provider_name)
        };
      })
    );

    console.log('Final movies response:', movies);

    return new Response(
      JSON.stringify({ movies }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-movies function:', error);
    
    // Return random popular movies in case of error
    try {
      const fallbackUrl = buildSearchUrl({}, Math.floor(Math.random() * 10) + 1);
      const fallbackData = await searchMovies(fallbackUrl);
      
      const movies = fallbackData.results
        .sort(() => Math.random() - 0.5)
        .slice(0, 6)
        .map((movie: any) => ({
          title: movie.title,
          year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
          poster: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster',
          synopsis: movie.overview || 'No synopsis available',
          streaming: []
        }));

      return new Response(
        JSON.stringify({ movies }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fallbackError) {
      return new Response(
        JSON.stringify({ error: 'Failed to get movie recommendations' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }
});