import { z } from "zod";

export const createPlayerSchema = z.object({
  nickname: z.string().min(2).max(40),
  avatarSlug: z.string().min(2).max(120).optional().nullable(),
});

export const startQuizSessionSchema = z.object({
  playerId: z.string().min(1),
  categorySlug: z.string().min(1).optional(),
  difficultySlug: z.string().min(1).optional(),
  questionCount: z.number().int().min(1).max(20).optional().default(5),
  mode: z.string().min(1).optional(),
});

export const triviaLevelMapQuerySchema = z.object({
  playerId: z.string().min(1),
});

export const submitQuizAnswerSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  selectedText: z.string().min(1).max(250),
});

export const startMemoryVerseSessionSchema = z.object({
  playerId: z.string().min(1),
  categorySlug: z.string().min(1).optional(),
  difficultySlug: z.string().min(1).optional(),
  verseCount: z.number().int().min(1).max(20).optional().default(3),
});

export const submitMemoryVerseAnswerSchema = z.object({
  sessionId: z.string().min(1),
  verseId: z.string().min(1),
  answerText: z.string().min(1).max(2000),
});

export const listLevelsQuerySchema = z.object({
  playerId: z.string().min(1),
});

export const startLevelSessionSchema = z.object({
  playerId: z.string().min(1),
  restart: z.boolean().optional(),
});

export const requestLevelHintSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
});

export const submitLevelAnswerSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  selectedText: z.string().min(1).max(250),
});