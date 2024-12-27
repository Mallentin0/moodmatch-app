import { Claude } from "@anthropic-ai/sdk";

const systemPrompt = `You are a movie recommendation expert. Analyze the user's request and extract key preferences:
- Genre preferences
- Mood/tone (e.g., funny, dark, nostalgic)
- Time period preferences
- Any specific actors or directors
- Streaming platform preferences

Return a JSON object with these extracted preferences that we can use to search for movies.`;

export const analyzeUserPrompt = async (prompt: string): Promise<string> => {
  const claude = new Claude({
    apiKey: process.env.CLAUDE_API_KEY,
  });

  const message = await claude.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1000,
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return message.content[0].text;
};