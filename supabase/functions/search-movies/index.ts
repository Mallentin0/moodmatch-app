import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
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
    console.log('Received prompt:', prompt);

    // First, use Claude to analyze the prompt
    console.log('Calling Claude API...');
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Analyze this movie request and extract key search terms: "${prompt}". 
          If the request is vague or unclear, interpret it as best as possible and add relevant search terms.
          Return only a JSON object with these fields:
          - searchQuery (string): The main search terms (if unclear, use "popular" or "highly rated")
          - genre (string, optional): The main genre if mentioned or implied
          - year (number, optional): Specific year or decade mentioned
          - mood (string, optional): The mood/tone mentioned or implied
          Format as valid JSON only, no other text.`
        }]
      })
    });

    const claudeData = await claudeResponse.json();
    console.log('Claude response:', claudeData);
    
    if (!claudeData.content || !claudeData.content[0] || !claudeData.content[0].text) {
      throw new Error('Invalid Claude API response');
    }

    const searchParams = JSON.parse(claudeData.content[0].text);
    console.log('Parsed search parameters:', searchParams);

    // Use the analyzed parameters to search TMDB
    console.log('Calling TMDB API...');
    let searchUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false`;
    
    // Add search parameters if they exist
    if (searchParams.searchQuery && searchParams.searchQuery !== "popular") {
      searchUrl += `&with_keywords=${encodeURIComponent(searchParams.searchQuery)}`;
    }
    if (searchParams.year) {
      searchUrl += `&year=${searchParams.year}`;
    }
    if (searchParams.genre) {
      searchUrl += `&with_genres=${searchParams.genre}`;
    }
    
    console.log('TMDB URL:', searchUrl);
    
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const searchData = await searchResponse.json();
    console.log('TMDB search response:', searchData);
    
    if (!searchData.results || !Array.isArray(searchData.results)) {
      throw new Error('Invalid TMDB API response');
    }

    // If no results found, fetch popular movies as fallback
    if (searchData.results.length === 0) {
      console.log('No results found, fetching popular movies as fallback...');
      const fallbackUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US`;
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();
      searchData.results = fallbackData.results;
    }

    // Transform and limit the results
    const movies = await Promise.all(
      searchData.results.slice(0, 6).map(async (movie: any) => {
        console.log('Processing movie:', movie.title);
        
        // Get more details for each movie
        const detailsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=watch/providers`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        const details = await detailsResponse.json();
        console.log('Movie details:', details);
        
        // Extract streaming providers (US region)
        const providers = details['watch/providers']?.results?.US?.flatrate || [];
        
        return {
          title: movie.title,
          year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
          poster: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster',
          synopsis: movie.overview || 'No synopsis available',
          streaming: providers.map((provider: any) => provider.provider_name)
        };
      })
    );

    console.log('Final movies response:', movies);

    return new Response(
      JSON.stringify({ movies }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in search-movies function:', error);
    
    // In case of any error, return popular movies as fallback
    try {
      console.log('Error occurred, fetching popular movies as fallback...');
      const fallbackUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US`;
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();
      
      const movies = fallbackData.results.slice(0, 6).map((movie: any) => ({
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
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    } catch (fallbackError) {
      return new Response(
        JSON.stringify({ error: 'Failed to get movie recommendations' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }
  }
});