import { z } from "zod";

const OMDB_BASE_URL = "https://www.omdbapi.com/";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

const omdbFetch = async (params: Record<string, string>) => {
  const queryString = new URLSearchParams({
    apikey: process.env.OMDB_API_KEY || "",
    ...params
  }).toString();
  
  const response = await fetch(`${OMDB_BASE_URL}?${queryString}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('OMDB API Error:', errorData);
    throw new Error(`OMDB API error: ${errorData.Error || 'Unknown error'}`);
  }
  
  return response.json();
};

const tmdbFetch = async (endpoint: string, options: RequestOptions = {}) => {
  const url = `${TMDB_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${process.env.TMDB_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('TMDB API Error:', errorData);
    throw new Error(`TMDB API error: ${errorData.status_message || 'Unknown error'}`);
  }

  return response.json();
};

export const searchMovies = async (query: string) => {
  // First search with OMDB
  const omdbData = await omdbFetch({ s: query });
  const omdbResults = omdbData.Search || [];

  // Then enhance with TMDB data
  const tmdbData = await tmdbFetch(`/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`);
  const tmdbResults = tmdbData.results || [];

  // Combine and deduplicate results
  const combinedResults = [...omdbResults];
  
  // Add unique TMDB results
  tmdbResults.forEach((tmdbMovie: any) => {
    const exists = combinedResults.some(
      (movie) => movie.Title?.toLowerCase() === tmdbMovie.title?.toLowerCase()
    );
    if (!exists) {
      combinedResults.push({
        Title: tmdbMovie.title,
        Year: tmdbMovie.release_date?.split('-')[0] || 'N/A',
        imdbID: tmdbMovie.imdb_id || `tmdb-${tmdbMovie.id}`,
        Poster: tmdbMovie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
          : 'N/A',
      });
    }
  });

  return combinedResults;
};

export const getMovieDetails = async (imdbId: string) => {
  // Get OMDB details
  const omdbDetails = await omdbFetch({ i: imdbId });

  // If it's a TMDB ID (no OMDB data), get TMDB details
  if (imdbId.startsWith('tmdb-')) {
    const tmdbId = imdbId.replace('tmdb-', '');
    const tmdbDetails = await tmdbFetch(`/movie/${tmdbId}?language=en-US`);
    
    return {
      Title: tmdbDetails.title,
      Year: tmdbDetails.release_date?.split('-')[0] || 'N/A',
      Poster: tmdbDetails.poster_path 
        ? `https://image.tmdb.org/t/p/w500${tmdbDetails.poster_path}`
        : 'N/A',
      Plot: tmdbDetails.overview,
      Director: 'N/A', // TMDB doesn't provide this directly
      Actors: 'N/A', // TMDB doesn't provide this directly
      Awards: 'N/A',
      Ratings: [
        {
          Source: 'TMDB',
          Value: `${tmdbDetails.vote_average}/10`
        }
      ]
    };
  }

  return omdbDetails;
};

export const MovieSchema = z.object({
  title: z.string(),
  year: z.string(),
  poster: z.string(),
  synopsis: z.string(),
  streaming: z.array(z.string()).optional(),
  ratings: z.array(z.object({
    Source: z.string().optional(),
    Value: z.string().optional()
  })).optional(),
  director: z.string().optional(),
  actors: z.string().optional(),
  awards: z.string().optional(),
});

export type Movie = z.infer<typeof MovieSchema>;