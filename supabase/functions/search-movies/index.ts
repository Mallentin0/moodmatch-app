import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzePrompt } from "./claude.ts";
import { fetchMovieDetails, searchMovies, buildSearchUrl, type MovieResult } from "./tmdb.ts";
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
    console.log('Received prompt:', prompt);

    // Analyze prompt using Claude
    console.log('Calling Claude API...');
    const searchParams = await analyzePrompt(prompt);
    console.log('Parsed search parameters:', searchParams);

    // Extract streaming platforms from the prompt
    const streamingPlatforms = [
      'Netflix', 'Hulu', 'Amazon Prime Video', 'Disney+', 
      'HBO Max', 'Apple TV+', 'Paramount+', 'Peacock', 'Crunchyroll'
    ].filter(platform => 
      prompt.toLowerCase().includes(platform.toLowerCase())
    );

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
      .slice(0, 12);

    // Transform and filter the results based on streaming platforms
    const movies: MovieResult[] = await Promise.all(
      shuffledResults.map(async (movie: any) => {
        console.log('Processing movie:', movie.title);
        const details = await fetchMovieDetails(movie.id);
        
        // Extract streaming providers (US region)
        const providers = details['watch/providers']?.results?.US?.flatrate || [];
        const movieStreamingPlatforms = providers.map((p: any) => p.provider_name);

        // If streaming platforms were specified in the prompt, check if the movie is available on any of them
        if (streamingPlatforms.length > 0) {
          const hasRequestedPlatform = movieStreamingPlatforms.some(platform =>
            streamingPlatforms.some(requested => 
              platform.toLowerCase().includes(requested.toLowerCase())
            )
          );
          
          if (!hasRequestedPlatform) {
            return null;
          }
        }

        const baseMovie = {
          title: movie.title,
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

        // Enrich with OMDb data
        return await enrichWithOMDbData(baseMovie);
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
    
    // Return random popular movies in case of error
    try {
      const fallbackUrl = buildSearchUrl({}, Math.floor(Math.random() * 10) + 1);
      const fallbackData = await searchMovies(fallbackUrl);
      
      const movies = await Promise.all(
        fallbackData.results
          .sort(() => Math.random() - 0.5)
          .slice(0, 6)
          .map(async (movie: any) => {
            const baseMovie = {
              title: movie.title,
              year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
              poster: movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Poster',
              synopsis: movie.overview || 'No synopsis available',
              streaming: []
            };
            return await enrichWithOMDbData(baseMovie);
          })
      );

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