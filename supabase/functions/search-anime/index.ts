import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzePrompt } from "../search-movies/claude.ts";

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
    console.log('Received anime search prompt:', prompt);

    // Use Claude to analyze the prompt
    const searchParams = await analyzePrompt(prompt);
    console.log('Parsed search parameters:', searchParams);

    // Search anime using Jikan API
    const searchUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchParams.keywords.join(' '))}&limit=6`;
    console.log('Jikan API URL:', searchUrl);

    const response = await fetch(searchUrl);
    const data = await response.json();

    // Transform the results to match our existing movie format
    const animeResults = data.data.map((anime: any) => ({
      title: anime.title,
      year: anime.year?.toString() || 'N/A',
      poster: anime.images.jpg.large_image_url,
      synopsis: anime.synopsis || 'No synopsis available',
      streaming: anime.streaming || [],
      genre: anime.genres?.map((g: any) => g.name) || [],
      tone: [anime.rating?.replace('_', ' ') || 'Not rated'],
      theme: anime.themes?.map((t: any) => t.name) || [],
      ratings: [{
        source: 'MyAnimeList',
        value: `${anime.score}/10`
      }],
      runtime: `${anime.episodes || '?'} episodes`,
      director: anime.producers?.[0]?.name || 'Unknown',
      type: 'anime'
    }));

    console.log('Processed anime results:', animeResults);

    return new Response(
      JSON.stringify({ movies: animeResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-anime function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get anime recommendations' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});