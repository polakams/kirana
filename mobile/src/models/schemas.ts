import { z } from 'zod';

export const OrderItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string(),
});

export const ParseResultSchema = z.object({
  items: z.array(OrderItemSchema),
  confidence: z.enum(['high', 'medium', 'low']),
  notes: z.string().optional(),
});

export type ParseResult = z.infer<typeof ParseResultSchema>;
export type ParsedItem = z.infer<typeof OrderItemSchema>;
