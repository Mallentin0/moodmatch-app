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

    // Get a random page number between 1 and 5 to vary results
    const randomPage = Math.floor(Math.random() * 5) + 1;
    
    // Use the analyzed parameters to search TMDB with different sorting options
    console.log('Calling TMDB API...');
    const sortOptions = ['popularity.desc', 'vote_average.desc', 'revenue.desc'];
    const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
    
    let searchUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=${randomSort}&include_adult=false&page=${randomPage}`;
    
    // Add search parameters if they exist
    if (searchParams.searchQuery && searchParams.searchQuery !== "popular") {
      searchUrl += `&with_keywords=${encodeURIComponent(searchParams.searchQuery)}`;
    }
    if (searchParams.year) {
      searchUrl += `&primary_release_year=${searchParams.year}`;
    }
    if (searchParams.genre) {
      searchUrl += `&with_genres=${searchParams.genre}`;
    }
    
    console.log('TMDB URL:', searchUrl);
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    console.log('TMDB search response:', searchData);
    
    if (!searchData.results || !Array.isArray(searchData.results)) {
      throw new Error('Invalid TMDB API response');
    }

    // If no results found, try a different approach
    if (searchData.results.length === 0) {
      console.log('No results found, trying alternative search...');
      // Try searching with just the genre or a broader time period
      const fallbackUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&page=${randomPage}${searchParams.genre ? `&with_genres=${searchParams.genre}` : ''}`;
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();
      searchData.results = fallbackData.results;
    }

    // Shuffle the results array to get random selections
    const shuffledResults = searchData.results
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    // Transform and limit the results
    const movies = await Promise.all(
      shuffledResults.map(async (movie: any) => {
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
      const fallbackUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${Math.floor(Math.random() * 5) + 1}`;
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