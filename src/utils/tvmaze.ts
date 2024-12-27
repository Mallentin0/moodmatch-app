export interface TVShow {
  id: number;
  name: string;
  summary: string;
  image?: {
    medium?: string;
    original?: string;
  };
  premiered?: string;
  genres: string[];
  rating?: {
    average?: number;
  };
  network?: {
    name: string;
  };
}

export async function searchTVShows(query: string): Promise<TVShow[]> {
  try {
    const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.map((item: any) => item.show);
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    return [];
  }
}