import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzePrompt } from "../search-movies/claude.ts";

const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const OMDB_API_KEY = Deno.env.get('OMDB_API_KEY');

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

    // Use Claude to analyze the prompt
    const searchParams = await analyzePrompt(prompt);
    console.log('Claude analysis:', searchParams);

    // Build search query based on Claude's analysis
    const searchQuery = [
      searchParams.genre,
      ...searchParams.keywords,
      searchParams.mood,
      'tv series'
    ].filter(Boolean).join(' ');

    // Search TV shows using TMDB API
    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&page=1`
    );
    const tmdbData = await tmdbResponse.json();
    
    // Get initial results from TMDB
    const tmdbShows = tmdbData.results.slice(0, 3).map(async (show: any) => {
      // Get additional details from OMDB
      const omdbResponse = await fetch(
        `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(show.name)}&type=series`
      );
      const omdbData = await omdbResponse.json();

      return {
        title: show.name,
        year: show.first_air_date?.split('-')[0] || 'N/A',
        poster: show.poster_path 
          ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
          : 'https://via.placeholder.com/500x750?text=No+Poster',
        synopsis: show.overview || omdbData.Plot || 'No synopsis available',
        streaming: [], // We could enhance this with a streaming availability API
        genre: show.genre_ids ? show.genre_ids.map((id: number) => getGenreName(id)) : [],
        tone: searchParams.mood ? [searchParams.mood] : [],
        theme: omdbData.Genre ? omdbData.Genre.split(', ') : [],
        type: 'show' as const,
        ratings: omdbData.Ratings ? omdbData.Ratings : [],
        runtime: omdbData.Runtime || null,
        director: omdbData.Director || null,
        actors: omdbData.Actors ? omdbData.Actors.split(', ') : []
      };
    });

    // Search TV shows using OMDB API directly
    const omdbResponse = await fetch(
      `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(searchQuery)}&type=series`
    );
    const omdbData = await omdbResponse.json();
    
    const omdbShows = omdbData.Search ? 
      await Promise.all(omdbData.Search.slice(0, 3).map(async (show: any) => {
        // Get full details for each show
        const detailsResponse = await fetch(
          `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${show.imdbID}&type=series`
        );
        const details = await detailsResponse.json();

        return {
          title: show.Title,
          year: show.Year.split('–')[0],
          poster: show.Poster !== 'N/A' ? show.Poster : 'https://via.placeholder.com/500x750?text=No+Poster',
          synopsis: details.Plot || 'No synopsis available',
          streaming: [],
          genre: details.Genre ? details.Genre.split(', ') : [],
          tone: searchParams.mood ? [searchParams.mood] : [],
          theme: details.Genre ? details.Genre.split(', ') : [],
          type: 'show' as const,
          ratings: details.Ratings || [],
          runtime: details.Runtime || null,
          director: details.Director || null,
          actors: details.Actors ? details.Actors.split(', ') : []
        };
      }) : [];

    // Combine and deduplicate results
    const allShows = await Promise.all([...tmdbShows, ...omdbShows]);
    const uniqueShows = Array.from(new Map(allShows.map(show => 
      [show.title, show]
    )).values());

    // Limit to 6 results
    const finalResults = uniqueShows.slice(0, 6);

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

// Helper function to map TMDB genre IDs to names
function getGenreName(id: number): string {
  const genres: Record<number, string> = {
    10759: "Action & Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    10762: "Kids",
    9648: "Mystery",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",
    37: "Western"
  };
  return genres[id] || "Unknown";
}