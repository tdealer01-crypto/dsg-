import { z } from 'zod';

export const PayloadSchema = z.object({
  intent_score: z.number(),
  is_api_clean: z.boolean(),
  compute_cost: z.number(),
  is_grounded: z.boolean().optional(),
  source_verified: z.boolean().optional(),
  has_audit_trail: z.boolean().optional(),
  nonce_lock: z.boolean().optional(),
  value: z.number().optional()
});

export type Payload = z.infer<typeof PayloadSchema>;
