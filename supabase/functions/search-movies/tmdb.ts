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
  type?: 'movie' | 'show';
}

export async function fetchMovieDetails(movieId: number, type: 'movie' | 'tv'): Promise<any> {
  const response = await fetch(
    `https://api.themoviedb.org/3/${type}/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=watch/providers`,
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

export function buildSearchUrl(params: any, page: number, type: 'movie' | 'tv'): string {
  const sortOptions = ['popularity.desc', 'vote_average.desc', 'revenue.desc'];
  const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
  
  let searchUrl = `https://api.themoviedb.org/3/discover/${type}?api_key=${TMDB_API_KEY}&language=en-US&sort_by=${randomSort}&include_adult=false&page=${page}`;
  
  if (params.genre) {
    searchUrl += `&with_genres=${encodeURIComponent(params.genre)}`;
  }
  
  if (params.year) {
    const year = params.year.toString();
    if (year.length === 4) {
      searchUrl += type === 'movie' ? 
        `&primary_release_year=${year}` : 
        `&first_air_date_year=${year}`;
    } else if (year.length === 2) {
      const startYear = `19${year}`;
      const dateField = type === 'movie' ? 'primary_release_date' : 'first_air_date';
      searchUrl += `&${dateField}.gte=${startYear}-01-01&${dateField}.lte=${parseInt(startYear) + 9}-12-31`;
    }
  }
  
  if (params.keywords && params.keywords.length > 0) {
    searchUrl += `&with_keywords=${encodeURIComponent(params.keywords.join(','))}`;
  }

  return searchUrl;
}