import { z } from "zod";

const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzZDBjZGE0NDY2ZjI2OWU3OTNlOTI4M2YzZTdkNDliMSIsInN1YiI6IjY1OGJkNjc3ZWY5ZDcyNmY4ZmM5ZjVhYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Hs-Wh_vTdZBvhGVarSVhyGUgBQqM0g0Sy4FAhWuBHSo";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

const tmdbFetch = async (endpoint: string, options: RequestOptions = {}) => {
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
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
  const data = await tmdbFetch(`/search/movie?query=${encodeURIComponent(query)}&language=en-US`);
  return data.results;
};

export const getMovieDetails = async (movieId: number) => {
  // Get TMDB details
  const tmdbData = await tmdbFetch(`/movie/${movieId}?language=en-US&append_to_response=watch/providers`);

  // Get OMDb details using TMDB's IMDB ID
  if (tmdbData.imdb_id) {
    const omdbResponse = await fetch(
      `https://www.omdbapi.com/?i=${tmdbData.imdb_id}&apikey=${process.env.OMDB_API_KEY}`
    );
    const omdbData = await omdbResponse.json();

    // Combine data from both APIs
    return {
      ...tmdbData,
      ratings: omdbData.Ratings || [],
      director: omdbData.Director,
      actors: omdbData.Actors,
      awards: omdbData.Awards,
      boxOffice: omdbData.BoxOffice,
      extendedPlot: omdbData.Plot,
    };
  }

  return tmdbData;
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