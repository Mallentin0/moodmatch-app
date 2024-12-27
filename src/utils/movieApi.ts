import { z } from "zod";

const OMDB_BASE_URL = "https://www.omdbapi.com/";

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

export const searchMovies = async (query: string) => {
  // OMDB doesn't have a dedicated search endpoint, but we can use 's' parameter
  const data = await omdbFetch({ s: query });
  return data.Search || [];
};

export const getMovieDetails = async (imdbId: string) => {
  const data = await omdbFetch({ i: imdbId });
  return {
    ...data,
    ratings: data.Ratings || [],
    director: data.Director,
    actors: data.Actors,
    awards: data.Awards,
    watch: { providers: { results: { US: { flatrate: [] } } } }, // OMDB doesn't provide streaming info
  };
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