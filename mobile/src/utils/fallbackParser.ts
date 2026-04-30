import { generateId } from './idGenerator';
import type { OrderItem } from '../models/order';

const UNIT_MAP: Record<string, string> = {
  kg: 'kg', kilo: 'kg', kilos: 'kg', kilogram: 'kg', kilograms: 'kg',
  g: 'g', gram: 'g', grams: 'g',
  l: 'litre', ltr: 'litre', litre: 'litre', litres: 'litre', liter: 'litre', liters: 'litre',
  ml: 'ml', millilitre: 'ml', millilitres: 'ml',
  dozen: 'dozen', darjan: 'dozen', dz: 'dozen',
  pack: 'pack', packet: 'pack', packets: 'pack', packs: 'pack',
  piece: 'piece', pcs: 'piece', pieces: 'piece',
  bunch: 'bunch', bunches: 'bunch',
  bag: 'bag', bags: 'bag',
  bottle: 'bottle', bottles: 'bottle',
  can: 'can', cans: 'can',
  box: 'box', boxes: 'box',
};

const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  ek: 1, one: 1, a: 1,
  do: 2, two: 2,
  teen: 3, three: 3, tin: 3,
  char: 4, chaar: 4, four: 4,
  paanch: 5, panch: 5, five: 5,
  chhe: 6, six: 6,
  saat: 7, sat: 7, seven: 7,
  aath: 8, eight: 8,
  nau: 9, nine: 9,
  das: 10, ten: 10,
  eleven: 11, twelve: 12,
  half: 0.5,
};

function resolveNumber(token: string): number | null {
  const direct = parseFloat(token);
  if (!isNaN(direct)) return direct;
  return NUMBER_WORDS[token.toLowerCase()] ?? null;
}

export function parseFallback(transcript: string): OrderItem[] {
  const results: OrderItem[] = [];
  // Split on commas, "and", "aur", "also", "plus"
  const fragments = transcript.split(/,|\band\b|\baur\b|\balso\b|\bplus\b/i);

  for (const fragment of fragments) {
    const tokens = fragment.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;

    let quantity = 1;
    let unit = 'piece';
    let quantityFound = false;
    const usedIndices = new Set<number>();

    // Scan all tokens to find a number and unit (order-independent)
    for (let i = 0; i < tokens.length; i++) {
      if (!quantityFound) {
        const num = resolveNumber(tokens[i]);
        if (num !== null && num > 0) {
          quantity = num;
          quantityFound = true;
          usedIndices.add(i);
          // Check if next token is a unit
          if (i + 1 < tokens.length && UNIT_MAP[tokens[i + 1]]) {
            unit = UNIT_MAP[tokens[i + 1]];
            usedIndices.add(i + 1);
          }
          continue;
        }
      }
      // Also pick up a standalone unit if not yet found next to a number
      if (UNIT_MAP[tokens[i]] && !usedIndices.has(i)) {
        unit = UNIT_MAP[tokens[i]];
        usedIndices.add(i);
      }
    }

    // Remaining tokens form the item name
    const nameTokens = tokens.filter((_, i) => !usedIndices.has(i));
    const name = nameTokens.join(' ').trim();

    if (name.length > 0) {
      results.push({
        id: generateId(),
        name,
        quantity,
        unit,
        rawText: fragment.trim(),
      });
    }
  }

  return results;
}
