const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

export async function analyzePrompt(prompt: string): Promise<any> {
  console.log('Analyzing prompt with Claude:', prompt);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are "StreamFilter Claude," an AI assistant for moodwatch.ai.

Your Role:
- Read and analyze this search prompt: "${prompt}"
- Parse the query to identify:
  1) Genre (romantic comedy, horror, anime, etc.)
  2) Content type (movie, show, or both)
  3) Streaming platform (Netflix, Disney+, Hulu, "any," etc.)

Special Rules:
1. If user mentions "on Netflix," only include Netflix titles
2. If user mentions "on Disney," only include Disney+ titles
3. If user mentions "on Hulu," only include Hulu titles
4. If user says "shows" or "series," only include TV shows
5. If user says "movies," only include movies
6. If user says "anime," treat it as both a genre and content type
7. Convert informal genre terms (e.g., "rom com" => "romantic comedy")
8. If request is ambiguous, provide closest possible matches

Return ONLY a JSON object with these fields:
{
  "genre": string[],           // Array of relevant genres
  "contentType": string,       // "movie", "show", or "both"
  "streamingPlatforms": string[], // Array of specified platforms
  "tone": string[],           // Array of mood/tone descriptors
  "year": string | null,      // Specific year or decade if mentioned
  "keywords": string[]        // Additional search terms
}

Return valid JSON only, no other text.`
      }]
    })
  });

  if (!response.ok) {
    console.error('Claude API error:', await response.text());
    throw new Error('Failed to analyze prompt with Claude');
  }

  const data = await response.json();
  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Invalid Claude API response');
  }

  try {
    const parsedResponse = JSON.parse(data.content[0].text);
    console.log('Claude analysis result:', parsedResponse);
    return parsedResponse;
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw new Error('Failed to parse Claude response');
  }
}