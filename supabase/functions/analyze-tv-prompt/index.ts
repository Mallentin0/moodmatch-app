import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

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
          content: `You are "MovieRecommender Claude," an AI assistant for the web app moodwatch.ai.

## Role & Task
1. Read the user's text prompt describing the type of TV show they want to watch.
2. Parse the prompt to identify key attributes:
   - Genre (e.g., comedy, thriller, sci-fi)
   - Tone/mood (e.g., funny, dark, emotional)
   - Decade or year (e.g., 80s, 2005, etc.)
   - Preferred streaming platform (e.g., Netflix, "any," etc.)
   - Additional keywords or constraints (e.g., actors, themes, settings)
3. Return a concise set of search parameters in valid JSON format.

## Output Format
Return ONLY a JSON object with these fields:
- keywords (array of strings): Main search terms to find shows
- themes (array of strings): Key themes mentioned (e.g., "coming of age", "redemption")
- tones (array of strings): Emotional tones (e.g., "dark", "humorous")

For this prompt: "${prompt}"

Return valid JSON only, no other text.`
        }]
      })
    });

    const data = await response.json();
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Invalid Claude API response');
    }

    const analysis = JSON.parse(data.content[0].text);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-tv-prompt function:', error);
    return new Response(
      JSON.stringify({ 
        keywords: [req.prompt],
        themes: [],
        tones: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});