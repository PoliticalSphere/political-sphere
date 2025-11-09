import { z } from "zod";

export const PartySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  createdAt: z.date(),
});

export type Party = z.infer<typeof PartySchema>;

export const CreatePartySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export type CreatePartyInput = z.infer<typeof CreatePartySchema>;
