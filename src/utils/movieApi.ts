import { z } from "zod";

const TMDB_API_KEY = "3d0cda4466f269e793e9283f3e7d49b1";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const searchMovies = async (query: string) => {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`
  );
  const data = await response.json();
  return data.results;
};

export const getMovieDetails = async (movieId: number) => {
  // Get TMDB details
  const tmdbResponse = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=watch/providers`
  );
  const tmdbData = await tmdbResponse.json();

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
    Source: z.string(),
    Value: z.string()
  })).optional(),
  director: z.string().optional(),
  actors: z.string().optional(),
  awards: z.string().optional(),
});

export type Movie = z.infer<typeof MovieSchema>;