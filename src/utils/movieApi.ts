import { z } from "zod";

const TMDB_API_KEY = "3d0cda4466f269e793e9283f3e7d49b1"; // Public API key for demo
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const searchMovies = async (query: string) => {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`
  );
  const data = await response.json();
  return data.results;
};

export const getMovieDetails = async (movieId: number) => {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=watch/providers`
  );
  const data = await response.json();
  return data;
};

export const MovieSchema = z.object({
  title: z.string(),
  year: z.string(),
  poster: z.string(),
  synopsis: z.string(),
  streaming: z.array(z.string()).optional(),
});

export type Movie = z.infer<typeof MovieSchema>;