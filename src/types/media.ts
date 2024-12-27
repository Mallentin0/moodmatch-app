export type MediaType = 'movie' | 'show' | 'anime';

export interface Media {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  theme?: string[];
  genre?: string[];
  tone?: string[];
  type?: MediaType;
}