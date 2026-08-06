import type { Prisma } from "@prisma/client";
import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { slugify } from "../utils/slugify";

function buildSlug(value: string, fallback?: string) {
  return slugify(fallback || value);
}

function ensureCorrectAnswer(options: Array<{ isCorrect?: boolean }>) {
  if (!options.some((option) => option.isCorrect)) {
    throw AppError.badRequest("At least one option must be marked as correct");
  }
}

function buildQuestionWhere(filters: { search?: string; categoryId?: string; difficultyId?: string; isActive?: boolean }) {
  const where: Prisma.QuizQuestionWhereInput = {};

  if (filters.search) {
    where.OR = [{ prompt: { contains: filters.search, mode: "insensitive" } }];
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.difficultyId) {
    where.difficultyId = filters.difficultyId;
  }

  if (typeof filters.isActive === "boolean") {
    where.isActive = filters.isActive;
  }

  return where;
}

function buildVerseWhere(filters: { search?: string; categoryId?: string; difficultyId?: string; isActive?: boolean }) {
  const where: Prisma.BibleVerseWhereInput = {};

  if (filters.search) {
    where.OR = [
      { reference: { contains: filters.search, mode: "insensitive" } },
      { text: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.difficultyId) {
    where.difficultyId = filters.difficultyId;
  }

  if (typeof filters.isActive === "boolean") {
    where.isActive = filters.isActive;
  }

  return where;
}

export async function listCategories() {
  return prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
}

export async function listCategoriesPaged(params: { page?: number; limit?: number; search?: string }) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
  const skip = (page - 1) * limit;

  const where = params.search
    ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" as const } },
          { slug: { contains: params.search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [items, total] = await prisma.$transaction([
    prisma.category.findMany({ where, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], skip, take: limit }),
    prisma.category.count({ where }),
  ]);

  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function createCategory(data: any) {
  return prisma.category.create({
    data: {
      slug: data.slug || buildSlug(data.name),
      name: data.name,
      description: data.description ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateCategory(id: string, data: any) {
  const current = await prisma.category.findUnique({ where: { id } });

  if (!current) {
    throw AppError.notFound("Category not found");
  }

  return prisma.category.update({
    where: { id },
    data: {
      slug: data.slug || (data.name ? buildSlug(data.name) : current.slug),
      name: data.name ?? current.name,
      description: data.description ?? current.description,
      sortOrder: data.sortOrder ?? current.sortOrder,
      isActive: data.isActive ?? current.isActive,
    },
  });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

export async function listDifficulties() {
  return prisma.difficultyLevel.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
}

export async function listDifficultiesPaged(params: { page?: number; limit?: number; search?: string }) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
  const skip = (page - 1) * limit;

  const where = params.search
    ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" as const } },
          { slug: { contains: params.search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [items, total] = await prisma.$transaction([
    prisma.difficultyLevel.findMany({ where, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], skip, take: limit }),
    prisma.difficultyLevel.count({ where }),
  ]);

  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function createDifficulty(data: any) {
  return prisma.difficultyLevel.create({
    data: {
      slug: data.slug || buildSlug(data.name),
      name: data.name,
      description: data.description ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateDifficulty(id: string, data: any) {
  const current = await prisma.difficultyLevel.findUnique({ where: { id } });

  if (!current) {
    throw AppError.notFound("Difficulty level not found");
  }

  return prisma.difficultyLevel.update({
    where: { id },
    data: {
      slug: data.slug || (data.name ? buildSlug(data.name) : current.slug),
      name: data.name ?? current.name,
      description: data.description ?? current.description,
      sortOrder: data.sortOrder ?? current.sortOrder,
      isActive: data.isActive ?? current.isActive,
    },
  });
}

export async function deleteDifficulty(id: string) {
  return prisma.difficultyLevel.delete({ where: { id } });
}

export async function listQuestions(filters: { search?: string; categoryId?: string; difficultyId?: string; isActive?: boolean }) {
  return prisma.quizQuestion.findMany({
    where: buildQuestionWhere(filters),
    include: { category: true, difficulty: true, options: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function listQuestionsPaged(filters: { search?: string; categoryId?: string; difficultyId?: string; isActive?: boolean; page?: number; limit?: number }) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);
  const skip = (page - 1) * limit;

  const where = buildQuestionWhere(filters);
  const [items, total] = await prisma.$transaction([
    prisma.quizQuestion.findMany({
      where,
      include: { category: true, difficulty: true, options: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.quizQuestion.count({ where }),
  ]);

  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

async function syncQuestionOptions(tx: Prisma.TransactionClient, questionId: string, options: Array<{ text: string; isCorrect?: boolean; sortOrder?: number }>) {
  ensureCorrectAnswer(options);

  await tx.quizOption.deleteMany({ where: { questionId } });

  await tx.quizOption.createMany({
    data: options.map((option) => ({
      questionId,
      text: option.text,
      isCorrect: option.isCorrect ?? false,
      sortOrder: option.sortOrder ?? 0,
    })),
  });
}

export async function createQuestion(data: any) {
  ensureCorrectAnswer(data.options);

  return prisma.$transaction(async (tx) => {
    const question = await tx.quizQuestion.create({
      data: {
        slug: data.slug || buildSlug(data.prompt),
        categoryId: data.categoryId ?? null,
        difficultyId: data.difficultyId ?? null,
        prompt: data.prompt,
        explanation: data.explanation ?? null,
        scriptureReference: data.scriptureReference ?? null,
        imageUrl: data.imageUrl ?? null,
        imageAlt: data.imageAlt ?? null,
        xpReward: data.xpReward ?? 10,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });

    await syncQuestionOptions(tx, question.id, data.options);

    return tx.quizQuestion.findUniqueOrThrow({
      where: { id: question.id },
      include: { category: true, difficulty: true, options: { orderBy: { sortOrder: "asc" } } },
    });
  });
}

export async function updateQuestion(id: string, data: any) {
  const current = await prisma.quizQuestion.findUnique({ where: { id } });

  if (!current) {
    throw AppError.notFound("Question not found");
  }

  return prisma.$transaction(async (tx) => {
    const question = await tx.quizQuestion.update({
      where: { id },
      data: {
        slug: data.slug || (data.prompt ? buildSlug(data.prompt) : current.slug),
        categoryId: data.categoryId ?? current.categoryId,
        difficultyId: data.difficultyId ?? current.difficultyId,
        prompt: data.prompt ?? current.prompt,
        explanation: data.explanation ?? current.explanation,
        scriptureReference: data.scriptureReference ?? current.scriptureReference,
        imageUrl: data.imageUrl ?? current.imageUrl,
        imageAlt: data.imageAlt ?? current.imageAlt,
        xpReward: data.xpReward ?? current.xpReward,
        sortOrder: data.sortOrder ?? current.sortOrder,
        isActive: data.isActive ?? current.isActive,
      },
    });

    if (Array.isArray(data.options)) {
      await syncQuestionOptions(tx, question.id, data.options);
    }

    return tx.quizQuestion.findUniqueOrThrow({
      where: { id: question.id },
      include: { category: true, difficulty: true, options: { orderBy: { sortOrder: "asc" } } },
    });
  });
}

export async function deleteQuestion(id: string) {
  return prisma.quizQuestion.delete({ where: { id } });
}

export async function listVerses(filters: { search?: string; categoryId?: string; difficultyId?: string; isActive?: boolean }) {
  return prisma.bibleVerse.findMany({
    where: buildVerseWhere(filters),
    include: { category: true, difficulty: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function listVersesPaged(filters: { search?: string; categoryId?: string; difficultyId?: string; isActive?: boolean; page?: number; limit?: number }) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);
  const skip = (page - 1) * limit;

  const where = buildVerseWhere(filters);
  const [items, total] = await prisma.$transaction([
    prisma.bibleVerse.findMany({
      where,
      include: { category: true, difficulty: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.bibleVerse.count({ where }),
  ]);

  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function createVerse(data: any) {
  return prisma.bibleVerse.create({
    data: {
      slug: data.slug || buildSlug(data.reference),
      categoryId: data.categoryId ?? null,
      difficultyId: data.difficultyId ?? null,
      reference: data.reference,
      text: data.text,
      translation: data.translation ?? null,
      memoryHint: data.memoryHint ?? null,
      imageUrl: data.imageUrl ?? null,
      imageAlt: data.imageAlt ?? null,
      xpReward: data.xpReward ?? 8,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateVerse(id: string, data: any) {
  const current = await prisma.bibleVerse.findUnique({ where: { id } });

  if (!current) {
    throw AppError.notFound("Verse not found");
  }

  return prisma.bibleVerse.update({
    where: { id },
    data: {
      slug: data.slug || (data.reference ? buildSlug(data.reference) : current.slug),
      categoryId: data.categoryId ?? current.categoryId,
      difficultyId: data.difficultyId ?? current.difficultyId,
      reference: data.reference ?? current.reference,
      text: data.text ?? current.text,
      translation: data.translation ?? current.translation,
      memoryHint: data.memoryHint ?? current.memoryHint,
      imageUrl: data.imageUrl ?? current.imageUrl,
      imageAlt: data.imageAlt ?? current.imageAlt,
      xpReward: data.xpReward ?? current.xpReward,
      sortOrder: data.sortOrder ?? current.sortOrder,
      isActive: data.isActive ?? current.isActive,
    },
  });
}

export async function deleteVerse(id: string) {
  return prisma.bibleVerse.delete({ where: { id } });
}

export async function listMediaAssets() {
  return prisma.mediaAsset.findMany({ orderBy: [{ createdAt: "desc" }] });
}

export async function listMediaAssetsPaged(params: { page?: number; limit?: number; search?: string }) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
  const skip = (page - 1) * limit;

  const where = params.search
    ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" as const } },
          { slug: { contains: params.search, mode: "insensitive" as const } },
          { url: { contains: params.search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [items, total] = await prisma.$transaction([
    prisma.mediaAsset.findMany({ where, orderBy: [{ createdAt: "desc" }], skip, take: limit }),
    prisma.mediaAsset.count({ where }),
  ]);

  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function createMediaAsset(data: any) {
  return prisma.mediaAsset.create({
    data: {
      slug: data.slug || buildSlug(data.name || data.url),
      name: data.name ?? null,
      url: data.url,
      kind: data.kind ?? "image",
      altText: data.altText ?? null,
      mimeType: data.mimeType ?? null,
      source: data.source ?? null,
    },
  });
}

export async function updateMediaAsset(id: string, data: any) {
  const current = await prisma.mediaAsset.findUnique({ where: { id } });

  if (!current) {
    throw AppError.notFound("Media asset not found");
  }

  return prisma.mediaAsset.update({
    where: { id },
    data: {
      slug: data.slug || (data.name ? buildSlug(data.name) : current.slug),
      name: data.name ?? current.name,
      url: data.url ?? current.url,
      kind: data.kind ?? current.kind,
      altText: data.altText ?? current.altText,
      mimeType: data.mimeType ?? current.mimeType,
      source: data.source ?? current.source,
    },
  });
}

export async function deleteMediaAsset(id: string) {
  return prisma.mediaAsset.delete({ where: { id } });
}

type ImportPayload = {
  sourceName: string;
  replaceExisting?: boolean;
  categories?: Array<Record<string, any>>;
  difficulties?: Array<Record<string, any>>;
  mediaAssets?: Array<Record<string, any>>;
  quizQuestions?: Array<Record<string, any>>;
  verses?: Array<Record<string, any>>;
  wordSearchPuzzles?: Array<Record<string, any>>;
  characters?: Array<Record<string, any>>;
  stories?: Array<Record<string, any>>;
};

export async function importContent(payload: ImportPayload) {
  const job = await prisma.importJob.create({
    data: {
      type: "JSON",
      status: "PROCESSING",
      sourceName: payload.sourceName,
      payload: payload as Prisma.InputJsonValue,
      startedAt: new Date(),
      totalRecords:
        (payload.categories?.length ?? 0) +
        (payload.difficulties?.length ?? 0) +
        (payload.mediaAssets?.length ?? 0) +
        (payload.quizQuestions?.length ?? 0) +
        (payload.verses?.length ?? 0) +
        (payload.wordSearchPuzzles?.length ?? 0) +
        (payload.characters?.length ?? 0) +
        (payload.stories?.length ?? 0),
    },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const categoryMap = new Map<string, string>();
      const difficultyMap = new Map<string, string>();

      for (const item of payload.categories ?? []) {
        const category = await tx.category.upsert({
          where: { slug: item.slug || buildSlug(item.name) },
          create: {
            slug: item.slug || buildSlug(item.name),
            name: item.name,
            description: item.description ?? null,
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
          update: {
            name: item.name,
            description: item.description ?? null,
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
        });

        categoryMap.set(category.slug, category.id);
      }

      for (const item of payload.difficulties ?? []) {
        const difficulty = await tx.difficultyLevel.upsert({
          where: { slug: item.slug || buildSlug(item.name) },
          create: {
            slug: item.slug || buildSlug(item.name),
            name: item.name,
            description: item.description ?? null,
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
          update: {
            name: item.name,
            description: item.description ?? null,
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
        });

        difficultyMap.set(difficulty.slug, difficulty.id);
      }

      for (const item of payload.mediaAssets ?? []) {
        await tx.mediaAsset.upsert({
          where: { slug: item.slug || buildSlug(item.name || item.url) },
          create: {
            slug: item.slug || buildSlug(item.name || item.url),
            name: item.name ?? null,
            url: item.url,
            kind: item.kind ?? "image",
            altText: item.altText ?? null,
            mimeType: item.mimeType ?? null,
            source: item.source ?? null,
          },
          update: {
            name: item.name ?? null,
            url: item.url,
            kind: item.kind ?? "image",
            altText: item.altText ?? null,
            mimeType: item.mimeType ?? null,
            source: item.source ?? null,
          },
        });
      }

      for (const item of payload.quizQuestions ?? []) {
        const options = item.options ?? [];
        ensureCorrectAnswer(options);

        const question = await tx.quizQuestion.upsert({
          where: { slug: item.slug || buildSlug(item.prompt) },
          create: {
            slug: item.slug || buildSlug(item.prompt),
            categoryId: item.categoryId ?? (item.categorySlug ? categoryMap.get(item.categorySlug) ?? null : null),
            difficultyId: item.difficultyId ?? (item.difficultySlug ? difficultyMap.get(item.difficultySlug) ?? null : null),
            prompt: item.prompt,
            explanation: item.explanation ?? null,
            scriptureReference: item.scriptureReference ?? null,
            imageUrl: item.imageUrl ?? null,
            imageAlt: item.imageAlt ?? null,
            xpReward: item.xpReward ?? 10,
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
          update: {
            categoryId: item.categoryId ?? (item.categorySlug ? categoryMap.get(item.categorySlug) ?? null : null),
            difficultyId: item.difficultyId ?? (item.difficultySlug ? difficultyMap.get(item.difficultySlug) ?? null : null),
            prompt: item.prompt,
            explanation: item.explanation ?? null,
            scriptureReference: item.scriptureReference ?? null,
            imageUrl: item.imageUrl ?? null,
            imageAlt: item.imageAlt ?? null,
            xpReward: item.xpReward ?? 10,
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
        });

        await tx.quizOption.deleteMany({ where: { questionId: question.id } });
        await tx.quizOption.createMany({
          data: options.map((option: any) => ({
            questionId: question.id,
            text: option.text,
            isCorrect: option.isCorrect ?? false,
            sortOrder: option.sortOrder ?? 0,
          })),
        });
      }

      for (const item of payload.verses ?? []) {
        await tx.bibleVerse.upsert({
          where: { slug: item.slug || buildSlug(item.reference) },
          create: {
            slug: item.slug || buildSlug(item.reference),
            categoryId: item.categoryId ?? (item.categorySlug ? categoryMap.get(item.categorySlug) ?? null : null),
            difficultyId: item.difficultyId ?? (item.difficultySlug ? difficultyMap.get(item.difficultySlug) ?? null : null),
            reference: item.reference,
            text: item.text,
            translation: item.translation ?? null,
            memoryHint: item.memoryHint ?? null,
            imageUrl: item.imageUrl ?? null,
            imageAlt: item.imageAlt ?? null,
            xpReward: item.xpReward ?? 8,
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
          update: {
            categoryId: item.categoryId ?? (item.categorySlug ? categoryMap.get(item.categorySlug) ?? null : null),
            difficultyId: item.difficultyId ?? (item.difficultySlug ? difficultyMap.get(item.difficultySlug) ?? null : null),
            reference: item.reference,
            text: item.text,
            translation: item.translation ?? null,
            memoryHint: item.memoryHint ?? null,
            imageUrl: item.imageUrl ?? null,
            imageAlt: item.imageAlt ?? null,
            xpReward: item.xpReward ?? 8,
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
        });
      }

      for (const item of payload.wordSearchPuzzles ?? []) {
        await tx.wordSearchPuzzle.upsert({
          where: { slug: item.slug || buildSlug(item.title) },
          create: {
            slug: item.slug || buildSlug(item.title),
            title: item.title,
            words: item.words,
            gridSize: item.gridSize ?? 12,
            categoryId: item.categoryId ?? (item.categorySlug ? categoryMap.get(item.categorySlug) ?? null : null),
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
          update: {
            title: item.title,
            words: item.words,
            gridSize: item.gridSize ?? 12,
            categoryId: item.categoryId ?? (item.categorySlug ? categoryMap.get(item.categorySlug) ?? null : null),
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
        });
      }

      for (const item of payload.characters ?? []) {
        await tx.bibleCharacter.upsert({
          where: { slug: item.slug || buildSlug(item.name) },
          create: {
            slug: item.slug || buildSlug(item.name),
            name: item.name,
            clues: item.clues,
            imageUrl: item.imageUrl ?? null,
            categoryId: item.categoryId ?? (item.categorySlug ? categoryMap.get(item.categorySlug) ?? null : null),
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
          update: {
            name: item.name,
            clues: item.clues,
            imageUrl: item.imageUrl ?? null,
            categoryId: item.categoryId ?? (item.categorySlug ? categoryMap.get(item.categorySlug) ?? null : null),
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
        });
      }

      for (const item of payload.stories ?? []) {
        const story = await tx.bibleStory.upsert({
          where: { slug: item.slug || buildSlug(item.title) },
          create: {
            slug: item.slug || buildSlug(item.title),
            title: item.title,
            categoryId: item.categoryId ?? (item.categorySlug ? categoryMap.get(item.categorySlug) ?? null : null),
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
          update: {
            title: item.title,
            categoryId: item.categoryId ?? (item.categorySlug ? categoryMap.get(item.categorySlug) ?? null : null),
            sortOrder: item.sortOrder ?? 0,
            isActive: item.isActive ?? true,
          },
        });

        await tx.storyEvent.deleteMany({ where: { storyId: story.id } });
        await tx.storyEvent.createMany({
          data: (item.events ?? []).map((event: any, index: number) => ({
            storyId: story.id,
            text: event.text,
            correctOrder: event.correctOrder ?? index + 1,
          })),
        });
      }

      return {
        categories: categoryMap.size,
        difficulties: difficultyMap.size,
        mediaAssets: (payload.mediaAssets ?? []).length,
        quizQuestions: (payload.quizQuestions ?? []).length,
        verses: (payload.verses ?? []).length,
        wordSearchPuzzles: (payload.wordSearchPuzzles ?? []).length,
        characters: (payload.characters ?? []).length,
        stories: (payload.stories ?? []).length,
      };
    });

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        processedRecords:
          result.categories +
          result.difficulties +
          result.mediaAssets +
          result.quizQuestions +
          result.verses +
          result.wordSearchPuzzles +
          result.characters +
          result.stories,
        completedAt: new Date(),
      },
    });

    return { jobId: job.id, ...result };
  } catch (error) {
    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Import failed",
        completedAt: new Date(),
        failedRecords: job.totalRecords,
      },
    });

    throw error;
  }
}

export async function getImportJobs(params: { page?: number; limit?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.importJob.findMany({ orderBy: [{ createdAt: "desc" }], skip, take: limit }),
    prisma.importJob.count(),
  ]);

  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}