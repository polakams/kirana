import Anthropic from '@anthropic-ai/sdk';
import { ParseResultSchema, type ParseResult } from '../models/schemas';

const SYSTEM_PROMPT = `You are a grocery order parser for an Indian kirana store app.
Extract structured order items from spoken grocery lists.
Users may speak in English, Hindi, Telugu, Kannada, Tamil, Marathi, or mixed languages (Hinglish).
Always respond with valid JSON only. No explanations, no markdown, no code fences.

Rules:
- Convert spoken numbers to digits (ek=1, do=2, teen=3, char/chaar=4, paanch=5, chhe=6, saat=7, aath=8, nau=9, das=10)
- Normalize units: kilo/kg → "kg", gram/g → "g", litre/ltr/liter → "litre", ml → "ml", dozen/darjan → "dozen", packet/pack → "pack", piece/pcs → "piece", bunch → "bunch", bag → "bag", bottle → "bottle", can → "can"
- Normalize item names to English (doodh → "milk", tamatar → "tomatoes", aloo → "potatoes", pyaaz → "onions", anda → "eggs", chai → "tea", chawal → "rice", atta → "wheat flour", dal → "lentils", namak → "salt", cheeni → "sugar", tel → "oil")
- If quantity is unclear, default to 1
- If unit is not applicable (e.g. eggs, bananas, apples), use "piece"
- Ignore filler words like "chahiye", "lana", "dena", "please", "bhi", "aur"`;

export async function parseTranscriptWithClaude(
  transcript: string,
  apiKey: string
): Promise<ParseResult> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Parse this spoken grocery order into structured items:

Transcript: "${transcript}"

Respond with this exact JSON structure:
{
  "items": [
    { "name": "<English item name, normalized>", "quantity": <number>, "unit": "<kg|g|litre|ml|dozen|pack|piece|bunch|bag|bottle|can>" }
  ],
  "confidence": "<high|medium|low>",
  "notes": "<optional: any ambiguity you noticed>"
}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  const parsed = JSON.parse(content.text);
  return ParseResultSchema.parse(parsed);
}
