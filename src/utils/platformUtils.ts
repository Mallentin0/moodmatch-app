export const getPlatformDisplayName = (platform: string): string => {
  const platformMap: { [key: string]: string } = {
    'netflix': 'Netflix',
    'hulu': 'Hulu',
    'amazon': 'Prime Video',
    'prime': 'Prime Video',
    'disney': 'Disney+',
    'disney+': 'Disney+',
    'hbo': 'HBO Max',
    'hbomax': 'HBO Max',
    'apple': 'Apple TV+',
    'appletv+': 'Apple TV+',
    'paramount': 'Paramount+',
    'peacock': 'Peacock',
    'crunchyroll': 'Crunchyroll',
    'tubi': 'Tubi'
  };
  
  const normalizedPlatform = platform.toLowerCase().replace(/\s+/g, '');
  return platformMap[normalizedPlatform] || platform;
};