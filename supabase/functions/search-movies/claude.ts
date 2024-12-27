import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
- Analyze this search prompt, even if it's just one word: "${prompt}"
- For single-word prompts, infer the most likely interpretation:
  - If it's a genre (e.g., "horror"), treat it as a genre request
  - If it's a platform (e.g., "netflix"), treat it as a platform request
  - If it's a mood (e.g., "funny"), treat it as a tone/mood request
  - If it's a time period (e.g., "90s"), treat it as a year request

Special Rules:
1. For single-word platform names:
   - "netflix" => streaming platform Netflix
   - "disney" => streaming platform Disney+
   - "hulu" => streaming platform Hulu
2. For single-word genres:
   - "horror" => horror genre
   - "comedy" => comedy genre
   - "action" => action genre
3. For single-word moods:
   - "funny" => comedic tone
   - "scary" => horror/thriller tone
   - "romantic" => romance genre
4. Always provide reasonable defaults:
   - If no content type specified, default to "both"
   - If no year specified, return null
   - If no streaming platform specified, return empty array

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