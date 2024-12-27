export type MediaType = 'movie' | 'show' | 'anime';

export interface Movie {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  theme?: string[];
  genre?: string[];
  tone?: string[];
  type?: MediaType;
  tmdb_id?: number;
  imdb_id?: string;
  original_title?: string;
  first_air_date?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
}