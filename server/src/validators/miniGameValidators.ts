import { z } from "zod";

export const startVerseMatchSchema = z.object({
  playerId: z.string().min(1),
  pairCount: z.number().int().min(3).max(10).optional(),
});

export const completeVerseMatchSchema = z.object({
  sessionId: z.string().min(1),
  matchesFound: z.number().int().min(0),
  mistakeCount: z.number().int().min(0),
});

export const startFlashCardSchema = z.object({
  playerId: z.string().min(1),
  deckSize: z.number().int().min(5).max(25).optional(),
});

export const completeFlashCardSchema = z.object({
  sessionId: z.string().min(1),
  knewCount: z.number().int().min(0),
});

export const startScripturePuzzleSchema = z.object({
  playerId: z.string().min(1),
});

export const scripturePuzzleHintSchema = z.object({
  sessionId: z.string().min(1),
  verseId: z.string().min(1),
});

export const scripturePuzzleAnswerSchema = z.object({
  sessionId: z.string().min(1),
  verseId: z.string().min(1),
  orderedWords: z.array(z.string()).min(1),
});

export const startCharacterGuessSchema = z.object({
  playerId: z.string().min(1),
  roundCount: z.number().int().min(1).max(10).optional(),
});

export const characterHintSchema = z.object({
  sessionId: z.string().min(1),
  characterId: z.string().min(1),
});

export const characterGuessAnswerSchema = z.object({
  sessionId: z.string().min(1),
  characterId: z.string().min(1),
  guess: z.string().min(1).max(120),
});

export const startStoryOrderSchema = z.object({
  playerId: z.string().min(1),
});

export const storyOrderAnswerSchema = z.object({
  sessionId: z.string().min(1),
  storyId: z.string().min(1),
  orderedEventIds: z.array(z.string()).min(1),
});

const cellSchema = z.object({ row: z.number().int().min(0), col: z.number().int().min(0) });

export const startWordSearchSchema = z.object({
  playerId: z.string().min(1),
  puzzleSlug: z.string().min(1).optional(),
});

export const wordSearchFoundSchema = z.object({
  sessionId: z.string().min(1),
  word: z.string().min(1),
  path: z.array(cellSchema).min(1),
});

export const dailyChallengeQuerySchema = z.object({
  playerId: z.string().min(1),
});

export const dailyChallengeAnswerSchema = z.object({
  playerId: z.string().min(1),
  questionId: z.string().min(1),
  selectedText: z.string().min(1).max(250),
});
