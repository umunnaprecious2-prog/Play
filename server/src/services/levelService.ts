import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { calculateLevel, updateStreak } from "../utils/gameMath";

const POINTS_PER_QUESTION = 10;
const POINTS_PER_HINT = 2;
const MAX_HINTS_PER_QUESTION = 2;
const QUESTIONS_PER_LEVEL = 25;
const LEVEL_GAME_MODE = "quiz_level";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

async function awardProgressRewards(playerId: string) {
  const player = await prisma.playerProfile.findUnique({ where: { id: playerId } });

  if (!player) {
    throw AppError.notFound("Player profile not found");
  }

  const badges = await prisma.badge.findMany({
    where: {
      isActive: true,
      xpThreshold: { lte: player.xp },
      streakDaysNeeded: { lte: player.streakDays },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const unlockedBadges = await prisma.playerBadge.findMany({ where: { playerId } });
  const unlockedBadgeIds = new Set(unlockedBadges.map((badge) => badge.badgeId));
  const badgesToUnlock = badges.filter((badge) => !unlockedBadgeIds.has(badge.id));

  if (badgesToUnlock.length > 0) {
    await prisma.playerBadge.createMany({
      data: badgesToUnlock.map((badge) => ({ playerId, badgeId: badge.id })),
      skipDuplicates: true,
    });
  }

  const avatarItems = await prisma.avatarItem.findMany({
    where: {
      isActive: true,
      unlockXp: { lte: player.xp },
      unlockLevel: { lte: player.level },
      unlockStreakDays: { lte: player.streakDays },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const unlockedAvatars = await prisma.playerAvatarUnlock.findMany({ where: { playerId } });
  const unlockedAvatarIds = new Set(unlockedAvatars.map((avatar) => avatar.avatarItemId));
  const avatarsToUnlock = avatarItems.filter((avatar) => !unlockedAvatarIds.has(avatar.id));

  if (avatarsToUnlock.length > 0) {
    await prisma.playerAvatarUnlock.createMany({
      data: avatarsToUnlock.map((avatar) => ({ playerId, avatarItemId: avatar.id })),
      skipDuplicates: true,
    });
  }

  return { badgesUnlocked: badgesToUnlock, avatarsUnlocked: avatarsToUnlock };
}

export async function listLevelsForPlayer(playerId: string) {
  const player = await prisma.playerProfile.findUnique({ where: { id: playerId } });

  if (!player) {
    throw AppError.notFound("Player profile not found");
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { quizQuestions: { where: { isActive: true } } } },
    },
  });

  const progressRows = await prisma.playerLevelProgress.findMany({ where: { playerId } });
  const progressByCategory = new Map(progressRows.map((row) => [row.categoryId, row]));

  return categories.map((category, index) => {
    const progress = progressByCategory.get(category.id);

    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      levelNumber: index + 1,
      totalQuestions: category._count.quizQuestions,
      isReady: category._count.quizQuestions >= QUESTIONS_PER_LEVEL,
      isUnlocked: index === 0 || Boolean(progress?.isUnlocked),
      isCompleted: Boolean(progress?.isCompleted),
      bestScore: progress?.bestScore ?? 0,
      attempts: progress?.attempts ?? 0,
    };
  });
}

async function isLevelUnlocked(playerId: string, category: { id: string; sortOrder: number }) {
  const firstCategory = await prisma.category.findFirst({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (firstCategory?.id === category.id) {
    return true;
  }

  const progress = await prisma.playerLevelProgress.findUnique({
    where: { playerId_categoryId: { playerId, categoryId: category.id } },
  });

  return Boolean(progress?.isUnlocked);
}

export async function startLevelSession(input: { playerId: string; categorySlug: string }) {
  const player = await prisma.playerProfile.findUnique({ where: { id: input.playerId } });

  if (!player) {
    throw AppError.notFound("Player profile not found");
  }

  const category = await prisma.category.findUnique({ where: { slug: input.categorySlug } });

  if (!category || !category.isActive) {
    throw AppError.notFound("Level not found");
  }

  const unlocked = await isLevelUnlocked(input.playerId, category);

  if (!unlocked) {
    throw AppError.forbidden("Complete the previous level to unlock this one");
  }

  const questions = await prisma.quizQuestion.findMany({
    where: { isActive: true, categoryId: category.id },
    include: { options: { orderBy: { sortOrder: "asc" } }, category: true, difficulty: true },
    take: QUESTIONS_PER_LEVEL,
    orderBy: { sortOrder: "asc" },
  });

  if (questions.length === 0) {
    throw AppError.notFound("This level has no questions yet");
  }

  const session = await prisma.gameSession.create({
    data: {
      playerId: player.id,
      gameMode: LEVEL_GAME_MODE,
      totalQuestions: questions.length,
      metadata: { categorySlug: category.slug, categoryId: category.id },
    },
  });

  await prisma.playerLevelProgress.upsert({
    where: { playerId_categoryId: { playerId: player.id, categoryId: category.id } },
    create: { playerId: player.id, categoryId: category.id, isUnlocked: true, attempts: 1 },
    update: { attempts: { increment: 1 } },
  });

  return {
    session,
    level: { slug: category.slug, name: category.name },
    questions: shuffle(questions).map((question) => ({
      id: question.id,
      slug: question.slug,
      prompt: question.prompt,
      explanation: question.explanation,
      scriptureReference: question.scriptureReference,
      imageUrl: question.imageUrl,
      imageAlt: question.imageAlt,
      options: shuffle(question.options).map((option) => ({ id: option.id, text: option.text })),
    })),
  };
}

export async function requestLevelHint(input: { sessionId: string; questionId: string }) {
  const session = await prisma.gameSession.findUnique({ where: { id: input.sessionId } });

  if (!session || session.gameMode !== LEVEL_GAME_MODE) {
    throw AppError.notFound("Level session not found");
  }

  if (session.status !== "ACTIVE") {
    throw AppError.badRequest("This level session has already ended");
  }

  const existingAnswer = await prisma.gameSessionAnswer.findFirst({
    where: { sessionId: session.id, questionId: input.questionId },
  });

  if (existingAnswer) {
    throw AppError.badRequest("This question has already been answered");
  }

  const hintsUsed = await prisma.gameSessionHint.findMany({
    where: { sessionId: session.id, questionId: input.questionId },
  });

  if (hintsUsed.length >= MAX_HINTS_PER_QUESTION) {
    throw AppError.badRequest("No hints left for this question");
  }

  const question = await prisma.quizQuestion.findUnique({
    where: { id: input.questionId },
    include: { options: true },
  });

  if (!question) {
    throw AppError.notFound("Question not found");
  }

  const alreadyEliminated = new Set(hintsUsed.map((hint) => hint.eliminatedOptionId).filter(Boolean));
  const eliminationCandidates = question.options.filter(
    (option) => !option.isCorrect && !alreadyEliminated.has(option.id),
  );

  if (eliminationCandidates.length === 0) {
    throw AppError.badRequest("No hints left for this question");
  }

  const chosen = eliminationCandidates[Math.floor(Math.random() * eliminationCandidates.length)];
  const hintNumber = hintsUsed.length + 1;

  await prisma.gameSessionHint.create({
    data: {
      sessionId: session.id,
      questionId: input.questionId,
      hintNumber,
      eliminatedOptionId: chosen.id,
    },
  });

  return {
    hintNumber,
    eliminatedOptionId: chosen.id,
    eliminatedOptionText: chosen.text,
    hintsRemaining: MAX_HINTS_PER_QUESTION - hintNumber,
    maxPointsIfCorrect: Math.max(POINTS_PER_QUESTION - hintNumber * POINTS_PER_HINT, 0),
  };
}

export async function submitLevelAnswer(input: { sessionId: string; questionId: string; selectedText: string }) {
  const session = await prisma.gameSession.findUnique({
    where: { id: input.sessionId },
    include: { player: true },
  });

  if (!session || session.gameMode !== LEVEL_GAME_MODE) {
    throw AppError.notFound("Level session not found");
  }

  if (session.status !== "ACTIVE") {
    throw AppError.badRequest("This level session has already ended");
  }

  const question = await prisma.quizQuestion.findUnique({
    where: { id: input.questionId },
    include: { options: true, category: true },
  });

  if (!question) {
    throw AppError.notFound("Quiz question not found");
  }

  const hintsUsed = await prisma.gameSessionHint.count({
    where: { sessionId: session.id, questionId: input.questionId },
  });

  const correctOption = question.options.find((option) => option.isCorrect);
  const isCorrect = Boolean(correctOption && correctOption.text === input.selectedText);
  const pointsEarned = isCorrect ? Math.max(POINTS_PER_QUESTION - hintsUsed * POINTS_PER_HINT, 0) : 0;
  const starsAwarded = isCorrect && hintsUsed === 0 ? 1 : 0;

  const nextXp = session.player.xp + pointsEarned;
  const nextCorrect = session.correctCount + (isCorrect ? 1 : 0);
  const nextIncorrect = session.incorrectCount + (isCorrect ? 0 : 1);
  const nextStreak = updateStreak(session.player.lastActiveAt, session.player.streakDays);

  const updatedPlayer = await prisma.playerProfile.update({
    where: { id: session.playerId },
    data: {
      xp: nextXp,
      level: calculateLevel(nextXp),
      stars: session.player.stars + starsAwarded,
      streakDays: nextStreak,
      lastActiveAt: new Date(),
      totalGamesPlayed:
        session.player.totalGamesPlayed + (session.correctCount + session.incorrectCount + 1 >= session.totalQuestions ? 1 : 0),
      totalCorrect: session.player.totalCorrect + (isCorrect ? 1 : 0),
      totalIncorrect: session.player.totalIncorrect + (isCorrect ? 0 : 1),
    },
  });

  const answer = await prisma.gameSessionAnswer.create({
    data: {
      sessionId: session.id,
      questionId: question.id,
      selectedText: input.selectedText,
      isCorrect,
      xpAwarded: pointsEarned,
      metadata: { correctText: correctOption?.text ?? null, hintsUsed, pointsEarned },
    },
  });

  const totalAnswered = session.correctCount + session.incorrectCount + 1;
  const isLevelComplete = totalAnswered >= session.totalQuestions;

  const completedSession = await prisma.gameSession.update({
    where: { id: session.id },
    data: {
      correctCount: nextCorrect,
      incorrectCount: nextIncorrect,
      xpEarned: session.xpEarned + pointsEarned,
      starsEarned: session.starsEarned + starsAwarded,
      currentQuestion: totalAnswered,
      score: session.score + pointsEarned,
      status: isLevelComplete ? "COMPLETED" : "ACTIVE",
      completedAt: isLevelComplete ? new Date() : null,
    },
  });

  let nextLevelSlug: string | null = null;

  if (isLevelComplete && question.categoryId) {
    const existingProgress = await prisma.playerLevelProgress.findUnique({
      where: { playerId_categoryId: { playerId: session.playerId, categoryId: question.categoryId } },
    });
    const bestScore = Math.max(completedSession.score, existingProgress?.bestScore ?? 0);

    await prisma.playerLevelProgress.upsert({
      where: { playerId_categoryId: { playerId: session.playerId, categoryId: question.categoryId } },
      create: {
        playerId: session.playerId,
        categoryId: question.categoryId,
        isUnlocked: true,
        isCompleted: true,
        bestScore,
        completedAt: new Date(),
      },
      update: {
        isCompleted: true,
        bestScore,
        completedAt: new Date(),
      },
    });

    if (question.category) {
      const nextCategory = await prisma.category.findFirst({
        where: { isActive: true, sortOrder: { gt: question.category.sortOrder } },
        orderBy: { sortOrder: "asc" },
      });

      if (nextCategory) {
        await prisma.playerLevelProgress.upsert({
          where: { playerId_categoryId: { playerId: session.playerId, categoryId: nextCategory.id } },
          create: { playerId: session.playerId, categoryId: nextCategory.id, isUnlocked: true },
          update: { isUnlocked: true },
        });
        nextLevelSlug = nextCategory.slug;
      }
    }
  }

  const rewards = await awardProgressRewards(updatedPlayer.id);

  await prisma.playerProgressLog.create({
    data: {
      playerId: updatedPlayer.id,
      actionType: isCorrect ? "LEVEL_QUIZ_CORRECT" : "LEVEL_QUIZ_INCORRECT",
      xpDelta: pointsEarned,
      starsDelta: starsAwarded,
      streakDelta: isCorrect ? 1 : 0,
      metadata: { sessionId: completedSession.id, questionId: question.id, answerId: answer.id, hintsUsed },
    },
  });

  return {
    session: completedSession,
    player: updatedPlayer,
    answer,
    rewards,
    result: {
      isCorrect,
      pointsEarned,
      hintsUsed,
      starsAwarded,
      correctText: correctOption?.text ?? null,
      isComplete: isLevelComplete,
      nextLevelSlug,
    },
  };
}
