import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.14.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('CLAUDE_API_KEY')!,
    });

    const { prompt } = await req.json();

    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      temperature: 0.7,
      system: `You are a movie recommendation expert. Analyze the user's request and extract key preferences:
- Genre preferences
- Mood/tone (e.g., funny, dark, nostalgic)
- Time period preferences
- Any specific actors or directors
- Streaming platform preferences

Return a JSON object with these extracted preferences that we can use to search for movies.`,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Check if the content is available and is of type TextBlock
    if (!message.content[0] || !('text' in message.content[0])) {
      throw new Error('Unexpected response format from Claude');
    }

    return new Response(JSON.stringify({ analysis: message.content[0].text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-movie-prompt function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});