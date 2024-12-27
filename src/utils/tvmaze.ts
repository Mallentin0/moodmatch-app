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
    if (!response.ok) {
      throw new Error('Failed to fetch TV shows');
    }
    const data = await response.json();
    return data
      .map((item: any) => item.show)
      .filter((show: TVShow) => show.image?.medium || show.image?.original); // Filter out shows without images
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    return [];
  }
}