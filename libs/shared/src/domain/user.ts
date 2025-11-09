import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
