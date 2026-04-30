import { parseTranscriptWithClaude } from '../../src/services/claudeParser';
import { parseFallback } from '../../src/utils/fallbackParser';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { transcript: string };
    const { transcript } = body;

    if (!transcript || typeof transcript !== 'string') {
      return Response.json({ error: 'transcript is required' }, { status: 400 });
    }

    // Read API key from server-side environment variable only
    const apiKey = process.env.CLAUDE_API_KEY;
    if (apiKey) {
      const result = await parseTranscriptWithClaude(transcript, apiKey);
      return Response.json(result);
    }

    // Fallback: offline regex parser
    const items = parseFallback(transcript);
    return Response.json({
      items: items.map(({ id: _id, rawText: _raw, ...rest }) => rest),
      confidence: 'low',
      notes: 'Parsed offline without AI. Results may be less accurate.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Parse failed';
    // Return fallback if Claude fails
    try {
      const body = await (request.clone()).json() as { transcript: string };
      const items = parseFallback(body.transcript ?? '');
      return Response.json({
        items: items.map(({ id: _id, rawText: _raw, ...rest }) => rest),
        confidence: 'low',
        notes: `AI parsing failed (${message}). Used offline parser.`,
      });
    } catch {
      return Response.json({ error: message }, { status: 500 });
    }
  }
}
