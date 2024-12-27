import { serve } from 'https://deno.fresh.dev/std@v9.6.1/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
    
    // First, search for movies based on the prompt
    const searchResponse = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(prompt)}&language=en-US&page=1&include_adult=false`,
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