import { useState, useCallback } from 'react';
import type { OrderItem } from '../models/order';
import { ParseResultSchema } from '../models/schemas';
import { generateId } from '../utils/idGenerator';
import { parseFallback } from '../utils/fallbackParser';

interface ParseState {
  loading: boolean;
  error: string | null;
  confidence: 'high' | 'medium' | 'low' | null;
  notes: string | null;
}

export function useOrderParser() {
  const [state, setState] = useState<ParseState>({
    loading: false,
    error: null,
    confidence: null,
    notes: null,
  });

  const parseTranscript = useCallback(async (transcript: string): Promise<OrderItem[]> => {
    setState({ loading: true, error: null, confidence: null, notes: null });

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8081';

      const response = await fetch(`${apiUrl}/api/parse-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      const parsed = ParseResultSchema.parse(data);

      setState({
        loading: false,
        error: null,
        confidence: parsed.confidence,
        notes: parsed.notes ?? null,
      });

      return parsed.items.map((item) => ({
        id: generateId(),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Parsing failed';
      // Fall back to local parser
      const items = parseFallback(transcript);
      setState({
        loading: false,
        error: message,
        confidence: 'low',
        notes: 'Using offline parser. Connect to internet for better results.',
      });
      return items;
    }
  }, []);

  return { ...state, parseTranscript };
}
