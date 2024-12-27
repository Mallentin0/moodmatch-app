const OMDB_API_KEY = Deno.env.get('OMDB_API_KEY');

interface Movie {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  genre?: string[];
  tone?: string[];
  theme?: string[];
  ratings?: {
    source: string;
    value: string;
  }[];
  runtime?: string;
  director?: string;
  actors?: string[];
}

export async function enrichWithOMDbData(movie: Movie): Promise<Movie> {
  try {
    const response = await fetch(
      `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(movie.title)}&y=${movie.year}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const omdbData = await response.json();
    
    if (omdbData.Response === 'True') {
      console.log(`OMDb data found for ${movie.title}`);
      
      return {
        ...movie,
        ratings: omdbData.Ratings?.map((rating: any) => ({
          source: rating.Source,
          value: rating.Value,
        })) || [],
        runtime: omdbData.Runtime,
        director: omdbData.Director,
        actors: omdbData.Actors?.split(', ') || [],
      };
    }
    
    console.log(`No OMDb data found for ${movie.title}`);
    return movie;
  } catch (error) {
    console.error(`Error fetching OMDb data for ${movie.title}:`, error);
    return movie;
  }
}