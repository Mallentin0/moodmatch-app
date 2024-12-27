import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzePrompt } from "./claude.ts";
import { fetchMovieDetails, searchMovies, buildSearchUrl, getWatchProviders, getGenres } from "./tmdb.ts";

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

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Please provide a search prompt',
          message: 'Try something like "A heartwarming family movie from the 90s" or "Action thriller with plot twists on Netflix"'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Analyze prompt using Claude
    console.log('Calling Claude API...');
    const searchParams = await analyzePrompt(prompt);
    console.log('Parsed search parameters:', searchParams);

    // Get genres for mapping
    const genreMap = await getGenres();

    // Search for movies
    const searchUrl = buildSearchUrl(searchParams, 1);
    console.log('TMDB Search URL:', searchUrl);
    
    const searchData = await searchMovies(searchUrl);
    
    if (!searchData.results || searchData.results.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No movies found',
          message: 'Try being more specific with your search. Include details like:\n' +
                  '- Genre (comedy, thriller, drama)\n' +
                  '- Time period (90s, 2000s, recent)\n' +
                  '- Mood (funny, dark, heartwarming)\n' +
                  '- Streaming platform (Netflix, Hulu)\n\n' +
                  'Example: "A funny romantic comedy from the 90s on Netflix" or\n' +
                  '"Dark sci-fi thriller with plot twists on Hulu"'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    // Process results with enhanced error handling
    const movies = await Promise.all(
      searchData.results.slice(0, 6).map(async (movie: any) => {
        try {
          const details = await fetchMovieDetails(movie.id);
          const streamingPlatforms = await getWatchProviders(movie.id);
          
          return {
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            poster: movie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : 'https://via.placeholder.com/500x750?text=No+Poster',
            synopsis: movie.overview || 'No synopsis available',
            streaming: streamingPlatforms,
            genre: details.genres?.map((g: any) => g.name) || [],
            tone: searchParams.tone || [],
            theme: searchParams.theme || []
          };
        } catch (error) {
          console.error(`Error processing movie ${movie.id}:`, error);
          return null;
        }
      })
    );

    // Filter out any failed movie processing
    const validMovies = movies.filter(movie => movie !== null);

    if (validMovies.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Error processing movies',
          message: 'Please try a different search'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    return new Response(
      JSON.stringify({ movies: validMovies }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-movies function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});