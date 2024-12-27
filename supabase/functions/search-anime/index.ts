import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    console.log('Received anime search prompt:', prompt);

    // Check for inappropriate content in the prompt
    const inappropriateTerms = ['hentai', 'ecchi', 'erotica', 'nsfw'];
    if (inappropriateTerms.some(term => prompt.toLowerCase().includes(term))) {
      return new Response(
        JSON.stringify({ 
          movies: [],
          message: "Please use appropriate search terms" 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Search anime using Jikan API with safe ratings
    const searchUrl = new URL('https://api.jikan.moe/v4/anime');
    searchUrl.searchParams.append('q', prompt);
    searchUrl.searchParams.append('limit', '6');
    searchUrl.searchParams.append('sfw', 'true');
    searchUrl.searchParams.append('rating', 'g,pg,pg13'); // Only family-friendly content

    console.log('Jikan API URL:', searchUrl.toString());

    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Jikan API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received results from Jikan:', data.data.length);

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
        value: `${anime.score || 'N/A'}/10`
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
      JSON.stringify({ 
        error: 'Failed to get anime recommendations',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});