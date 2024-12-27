const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
const BASE_URL = 'https://api.themoviedb.org/3';

const headers = {
  'Authorization': `Bearer ${TMDB_API_KEY}`,
  'Content-Type': 'application/json',
};

export interface MovieResult {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  genre?: string[];
  tone?: string[];
  theme?: string[];
}

export async function fetchMovieDetails(movieId: number): Promise<any> {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}?append_to_response=watch/providers`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

export async function searchMovies(searchUrl: string): Promise<any> {
  const response = await fetch(searchUrl, { headers });
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

export function buildSearchUrl(params: any, page: number): string {
  const sortOptions = ['popularity.desc', 'vote_average.desc', 'revenue.desc'];
  const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
  
  let searchUrl = `${BASE_URL}/discover/movie?language=en-US&sort_by=${randomSort}&include_adult=false&page=${page}`;
  
  if (params.genre) {
    searchUrl += `&with_genres=${encodeURIComponent(params.genre)}`;
  }
  
  if (params.year) {
    const year = params.year.toString();
    if (year.length === 4) {
      searchUrl += `&primary_release_year=${year}`;
    } else if (year.length === 2) {
      const startYear = `19${year}`;
      searchUrl += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${parseInt(startYear) + 9}-12-31`;
    }
  }
  
  if (params.keywords && params.keywords.length > 0) {
    searchUrl += `&with_keywords=${encodeURIComponent(params.keywords.join(','))}`;
  }

  // Add region parameter for more relevant results
  searchUrl += '&region=US';

  return searchUrl;
}

// Helper function to get watch providers (streaming platforms)
export async function getWatchProviders(movieId: number): Promise<string[]> {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/watch/providers`,
    { headers }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const usProviders = data.results?.US?.flatrate || [];
  return usProviders.map((provider: any) => provider.provider_name);
}

// Helper function to get movie genres
export async function getGenres(): Promise<Map<number, string>> {
  const response = await fetch(
    `${BASE_URL}/genre/movie/list?language=en`,
    { headers }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch genres');
  }

  const data = await response.json();
  const genreMap = new Map();
  data.genres.forEach((genre: any) => {
    genreMap.set(genre.id, genre.name);
  });
  return genreMap;
}