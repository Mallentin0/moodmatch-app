import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const OMDB_API_KEY = Deno.env.get('OMDB_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
    console.log('Received TV show search prompt:', prompt);

    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // Search TV shows using TMDB API
    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(prompt)}&page=1&include_adult=false`
    );
    const tmdbData = await tmdbResponse.json();
    console.log('TMDB API response:', tmdbData);
    
    // Process TMDB results
    const tmdbShows = await Promise.all((tmdbData.results || []).slice(0, 6).map(async (show: any) => {
      try {
        // Get additional details from TMDB TV endpoint
        const detailsResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${show.id}?api_key=${TMDB_API_KEY}&append_to_response=watch/providers`
        );
        const details = await detailsResponse.json();

        // Get OMDB details for additional metadata
        const omdbResponse = await fetch(
          `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(show.name)}&type=series`
        );
        const omdbData = await omdbResponse.json();

        const showData = {
          tmdb_id: show.id,
          imdb_id: omdbData.imdbID,
          title: show.name,
          original_title: show.original_name,
          overview: show.overview,
          first_air_date: show.first_air_date,
          poster_path: show.poster_path 
            ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
            : null,
          genres: details.genres?.map((g: any) => g.name) || [],
          themes: omdbData.Genre ? omdbData.Genre.split(', ') : [],
          tones: omdbData.Genre ? omdbData.Genre.split(', ') : [],
          streaming_platforms: details.watch_providers?.results?.US?.flatrate?.map((p: any) => p.provider_name) || [],
          popularity: show.popularity,
          vote_average: show.vote_average,
          vote_count: show.vote_count
        };

        // Store or update the show in our database
        const { data: existingShow, error: fetchError } = await supabase
          .from('tv_shows')
          .select()
          .eq('tmdb_id', showData.tmdb_id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching existing show:', fetchError);
        }

        if (!existingShow) {
          const { error: insertError } = await supabase
            .from('tv_shows')
            .insert([showData]);

          if (insertError) {
            console.error('Error inserting show:', insertError);
          }
        } else {
          const { error: updateError } = await supabase
            .from('tv_shows')
            .update(showData)
            .eq('tmdb_id', showData.tmdb_id);

          if (updateError) {
            console.error('Error updating show:', updateError);
          }
        }

        return {
          ...showData,
          type: 'show' as const
        };
      } catch (error) {
        console.error('Error processing show:', error);
        return null;
      }
    }));

    // Filter out null results and limit to 6 shows
    const validShows = tmdbShows.filter((show): show is NonNullable<typeof show> => show !== null);
    const finalResults = validShows.slice(0, 6);

    console.log(`Returning ${finalResults.length} TV show results`);
    
    return new Response(
      JSON.stringify({ movies: finalResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-shows function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get TV show recommendations' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});