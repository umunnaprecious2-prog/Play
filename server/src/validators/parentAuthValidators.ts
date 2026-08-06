import { z } from "zod";

export const parentSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  claimPlayerId: z.string().min(1).optional(),
});

export const parentLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const addChildSchema = z.object({
  nickname: z.string().min(2).max(40),
  avatarSlug: z.string().min(2).max(120).optional().nullable(),
});

export const claimChildSchema = z.object({
  playerId: z.string().min(1),
});
