import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzePrompt } from "./claude.ts";
import { fetchMovieDetails, searchMovies, buildSearchUrl, searchMoviesByTitle, type MovieResult } from "./tmdb.ts";
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

    let allResults = [];
    const words = prompt.trim().split(/\s+/);

    // If it's a single word or appears to be a movie title (more than 3 words)
    if (words.length === 1 || words.length > 3) {
      console.log('Searching by title/keyword:', prompt);
      const titleResults = await searchMoviesByTitle(prompt);
      allResults = titleResults;
    } else {
      // Use Claude for more complex prompts
      console.log('Using Claude for analysis of complex prompt');
      const searchParams = await analyzePrompt(prompt);
      console.log('Parsed search parameters:', searchParams);

      // Get multiple random pages to increase variety
      const pages = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10) + 1);
      
      for (const page of pages) {
        const searchUrl = buildSearchUrl(searchParams, page);
        console.log(`TMDB URL for page ${page}:`, searchUrl);
        
        const searchData = await searchMovies(searchUrl);
        
        if (searchData.results && Array.isArray(searchData.results)) {
          allResults.push(...searchData.results);
        }
      }
    }

    // If no results found, try a broader search
    if (allResults.length === 0) {
      console.log('No results found, trying broader search...');
      const fallbackUrl = buildSearchUrl({}, Math.floor(Math.random() * 5) + 1);
      const fallbackData = await searchMovies(fallbackUrl);
      allResults.push(...fallbackData.results);
    }

    // Shuffle and take up to 6 random results
    const shuffledResults = allResults
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    // Transform the results
    const movies: MovieResult[] = await Promise.all(
      shuffledResults.map(async (movie: any) => {
        console.log('Processing movie:', movie.title);
        const details = await fetchMovieDetails(movie.id);
        
        const baseMovie = {
          title: movie.title,
          year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
          poster: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster',
          synopsis: movie.overview || 'No synopsis available',
          genre: details.genres?.map((g: any) => g.name) || [],
          type: 'movie'
        };

        // Enrich with OMDb data
        return await enrichWithOMDbData(baseMovie);
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
              type: 'movie'
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