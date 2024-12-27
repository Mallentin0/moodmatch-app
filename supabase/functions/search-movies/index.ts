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

    // First, use Claude to analyze the prompt with the specialized movie recommender system
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
          content: `You are "MovieRecommender Claude," an AI assistant for moodwatch.ai.
          
          Parse this prompt to identify key attributes and return ONLY a JSON object with these fields:
          - genre (string): Primary genre (e.g., comedy, thriller)
          - mood (string): Tone/mood (e.g., funny, dark)
          - year (number or null): Specific year or decade mentioned
          - keywords (array): Additional search terms
          - streaming (array): Mentioned streaming platforms
          
          For this prompt: "${prompt}"
          
          Return valid JSON only, no other text.`
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

    // Get multiple random pages to increase variety
    const pages = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10) + 1);
    const allResults = [];
    
    // Fetch movies from multiple pages
    for (const page of pages) {
      const sortOptions = ['popularity.desc', 'vote_average.desc', 'revenue.desc'];
      const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
      
      let searchUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=${randomSort}&include_adult=false&page=${page}`;
      
      if (searchParams.genre) {
        searchUrl += `&with_genres=${encodeURIComponent(searchParams.genre)}`;
      }
      
      if (searchParams.year) {
        const year = searchParams.year.toString();
        if (year.length === 4) {
          searchUrl += `&primary_release_year=${year}`;
        } else if (year.length === 2) {
          // Handle decades (e.g., "90s")
          const startYear = `19${year}`;
          searchUrl += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${parseInt(startYear) + 9}-12-31`;
        }
      }
      
      if (searchParams.keywords && searchParams.keywords.length > 0) {
        searchUrl += `&with_keywords=${encodeURIComponent(searchParams.keywords.join(','))}`;
      }

      console.log('TMDB URL for page ${page}:', searchUrl);
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (searchData.results && Array.isArray(searchData.results)) {
        allResults.push(...searchData.results);
      }
    }

    // If no results found, try a broader search
    if (allResults.length === 0) {
      console.log('No results found, trying broader search...');
      const fallbackUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&page=${Math.floor(Math.random() * 5) + 1}`;
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();
      allResults.push(...fallbackData.results);
    }

    // Shuffle all results and take 6 random ones
    const shuffledResults = allResults
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    // Transform the results
    const movies = await Promise.all(
      shuffledResults.map(async (movie: any) => {
        console.log('Processing movie:', movie.title);
        
        // Get more details including streaming providers
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
        
        // Filter streaming providers if specific platforms were requested
        const streamingProviders = searchParams.streaming?.length > 0
          ? providers.filter((p: any) => 
              searchParams.streaming.some((requested: string) => 
                p.provider_name.toLowerCase().includes(requested.toLowerCase())
              )
            )
          : providers;
        
        return {
          title: movie.title,
          year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
          poster: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster',
          synopsis: movie.overview || 'No synopsis available',
          streaming: streamingProviders.map((provider: any) => provider.provider_name)
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
    
    // In case of error, return random popular movies
    try {
      const randomPage = Math.floor(Math.random() * 10) + 1;
      const fallbackUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${randomPage}`;
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();
      
      const movies = fallbackData.results
        .sort(() => Math.random() - 0.5)
        .slice(0, 6)
        .map((movie: any) => ({
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