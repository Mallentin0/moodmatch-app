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

    // First, use Claude to analyze the prompt
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
          Return only a JSON object with these fields:
          - searchQuery (string): The main search terms
          - genre (string, optional): The main genre if mentioned
          - year (number, optional): Specific year or decade mentioned
          - mood (string, optional): The mood/tone mentioned
          Format as valid JSON only, no other text.`
        }]
      })
    });

    const claudeData = await claudeResponse.json();
    const searchParams = JSON.parse(claudeData.content[0].text);

    // Use the analyzed parameters to search TMDB
    const searchResponse = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&query=${encodeURIComponent(searchParams.searchQuery)}${searchParams.year ? `&year=${searchParams.year}` : ''}${searchParams.genre ? `&with_genres=${searchParams.genre}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const searchData = await searchResponse.json();
    
    // Transform and limit the results
    const movies = await Promise.all(
      searchData.results.slice(0, 6).map(async (movie: any) => {
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

    return new Response(
      JSON.stringify({ movies }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});