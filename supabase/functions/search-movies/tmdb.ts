const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');

export interface MovieResult {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  genre?: string[];
  tone?: string[];
  theme?: string[];
  type?: 'movie';
}

export async function fetchMovieDetails(movieId: number): Promise<any> {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=watch/providers`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.json();
}

export async function searchMovies(searchUrl: string): Promise<any> {
  const response = await fetch(searchUrl);
  return response.json();
}

export async function searchMoviesByTitle(query: string, page: number = 1): Promise<any[]> {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${page}&include_adult=false`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data.results || [];
}

export function buildSearchUrl(params: any, page: number): string {
  // Randomize sort options for more variety
  const sortOptions = [
    'popularity.desc',
    'vote_average.desc',
    'revenue.desc',
    'primary_release_date.desc',
    'vote_count.desc'
  ];
  const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
  
  let searchUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=${randomSort}&include_adult=false&page=${page}`;
  
  if (params.genre) {
    searchUrl += `&with_genres=${encodeURIComponent(params.genre)}`;
  }
  
  if (params.year) {
    const year = params.year.toString();
    if (year.length === 4) {
      // Add some randomness to year range
      const yearRange = Math.floor(Math.random() * 2) + 1;
      searchUrl += `&primary_release_date.gte=${parseInt(year) - yearRange}-01-01`;
      searchUrl += `&primary_release_date.lte=${parseInt(year) + yearRange}-12-31`;
    } else if (year.length === 2) {
      const startYear = `19${year}`;
      searchUrl += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${parseInt(startYear) + 9}-12-31`;
    }
  }
  
  if (params.keywords && params.keywords.length > 0) {
    // Randomly select a subset of keywords for more variety
    const randomKeywords = params.keywords
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.max(1, Math.floor(params.keywords.length / 2)));
    searchUrl += `&with_keywords=${encodeURIComponent(randomKeywords.join(','))}`;
  }

  // Add vote count threshold to ensure quality results
  searchUrl += '&vote_count.gte=100';

  return searchUrl;
}