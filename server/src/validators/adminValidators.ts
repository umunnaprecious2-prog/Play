import { z } from "zod";

const baseContentSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).optional(),
  description: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const mediaBaseSchema = z.object({
  name: z.string().min(2).max(140).optional().nullable(),
  slug: z.string().min(2).max(140).optional(),
  url: z.string().min(5),
  kind: z.string().min(2).max(50).optional().default("image"),
  altText: z.string().max(200).optional().nullable(),
  mimeType: z.string().max(100).optional().nullable(),
  source: z.string().max(200).optional().nullable(),
});

const optionSchema = z.object({
  text: z.string().min(1).max(250),
  isCorrect: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
});

const questionBaseSchema = z.object({
  slug: z.string().min(2).max(160).optional(),
  categoryId: z.string().optional().nullable(),
  difficultyId: z.string().optional().nullable(),
  prompt: z.string().min(5).max(500),
  explanation: z.string().max(1000).optional().nullable(),
  scriptureReference: z.string().max(200).optional().nullable(),
  imageUrl: z.string().min(5).optional().nullable(),
  imageAlt: z.string().max(200).optional().nullable(),
  xpReward: z.number().int().min(0).optional().default(10),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  options: z.array(optionSchema).min(2),
});

const questionUpdateInputSchema = questionBaseSchema.partial().extend({
  options: z.array(optionSchema).min(2).optional(),
});

const verseBaseSchema = z.object({
  slug: z.string().min(2).max(160).optional(),
  categoryId: z.string().optional().nullable(),
  difficultyId: z.string().optional().nullable(),
  reference: z.string().min(2).max(200),
  text: z.string().min(5).max(4000),
  translation: z.string().max(100).optional().nullable(),
  memoryHint: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().min(5).optional().nullable(),
  imageAlt: z.string().max(200).optional().nullable(),
  xpReward: z.number().int().min(0).optional().default(8),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const categoryCreateSchema = baseContentSchema;
export const categoryUpdateSchema = baseContentSchema.partial();
export const difficultyCreateSchema = baseContentSchema;
export const difficultyUpdateSchema = baseContentSchema.partial();
export const mediaCreateSchema = mediaBaseSchema;
export const mediaUpdateSchema = mediaBaseSchema.partial();
export const questionCreateSchema = questionBaseSchema;
export const questionUpdateSchema = questionUpdateInputSchema;
export const verseCreateSchema = verseBaseSchema;
export const verseUpdateSchema = verseBaseSchema.partial();

export const importSchema = z.object({
  sourceName: z.string().min(2).max(140),
  replaceExisting: z.boolean().optional().default(false),
  categories: z.array(categoryCreateSchema).optional().default([]),
  difficulties: z.array(difficultyCreateSchema).optional().default([]),
  mediaAssets: z.array(mediaCreateSchema).optional().default([]),
  quizQuestions: z.array(questionCreateSchema).optional().default([]),
  verses: z.array(verseCreateSchema).optional().default([]),
});