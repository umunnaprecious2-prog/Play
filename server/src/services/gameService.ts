import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { calculateLevel, updateStreak } from "../utils/gameMath";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
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

  const avatarSlug = player.avatarSlug || avatarsToUnlock[0]?.slug || null;

  if (avatarSlug !== player.avatarSlug) {
    await prisma.playerProfile.update({
      where: { id: playerId },
      data: { avatarSlug },
    });
  }

  return {
    badgesUnlocked: badgesToUnlock,
    avatarsUnlocked: avatarsToUnlock,
    avatarSlug,
  };
}

export async function createPlayerProfile(nickname: string, avatarSlug?: string | null) {
  return prisma.playerProfile.create({
    data: {
      nickname,
      avatarSlug: avatarSlug ?? null,
    },
  });
}

export async function getPlayerProfile(playerId: string) {
  const player = await prisma.playerProfile.findUnique({ where: { id: playerId } });

  if (!player) {
    throw AppError.notFound("Player profile not found");
  }

  return player;
}

const TRIVIA_MAX_LEVEL = 20;

// Trivia reuses this same quiz session infrastructure (gameMode stays "quiz"
// so nothing about Quick Practice's existing behavior changes), tagged with
// metadata.mode = "trivia" so its rounds can be counted separately for the
// level map. Previously round-tracking lived only in the browser
// (lib/player.ts's getNextTriviaRound), which incremented on every page
// load rather than every completion -- this makes it server-authoritative.
export async function getTriviaLevelMap(playerId: string) {
  const completedCount = await prisma.gameSession.count({
    where: {
      playerId,
      gameMode: "quiz",
      status: "COMPLETED",
      metadata: { path: ["mode"], equals: "trivia" },
    },
  });
  return { currentLevel: Math.min(completedCount + 1, TRIVIA_MAX_LEVEL), maxLevel: TRIVIA_MAX_LEVEL };
}

export async function startQuizSession(input: {
  playerId: string;
  categorySlug?: string;
  difficultySlug?: string;
  questionCount: number;
  mode?: string;
}) {
  const player = await prisma.playerProfile.findUnique({ where: { id: input.playerId } });

  if (!player) {
    throw AppError.notFound("Player profile not found");
  }

  const questions = await prisma.quizQuestion.findMany({
    where: {
      isActive: true,
      ...(input.categorySlug ? { category: { slug: input.categorySlug } } : {}),
      ...(input.difficultySlug ? { difficulty: { slug: input.difficultySlug } } : {}),
    },
    include: { options: { orderBy: { sortOrder: "asc" } }, category: true, difficulty: true },
    take: input.questionCount,
    orderBy: { createdAt: "desc" },
  });

  if (questions.length === 0) {
    throw AppError.notFound("No quiz questions available for the requested filters");
  }

  const session = await prisma.gameSession.create({
    data: {
      playerId: player.id,
      gameMode: "quiz",
      totalQuestions: questions.length,
      metadata: {
        categorySlug: input.categorySlug ?? null,
        difficultySlug: input.difficultySlug ?? null,
        mode: input.mode ?? null,
      },
    },
  });

  return {
    session,
    questions: questions.map((question) => ({
      id: question.id,
      slug: question.slug,
      prompt: question.prompt,
      explanation: question.explanation,
      scriptureReference: question.scriptureReference,
      imageUrl: question.imageUrl,
      imageAlt: question.imageAlt,
      xpReward: question.xpReward,
      category: question.category,
      difficulty: question.difficulty,
      options: shuffle(question.options).map((option) => ({
        id: option.id,
        text: option.text,
      })),
    })),
  };
}

export async function submitQuizAnswer(input: { sessionId: string; questionId: string; selectedText: string }) {
  const session = await prisma.gameSession.findUnique({
    where: { id: input.sessionId },
    include: { player: true },
  });

  if (!session) {
    throw AppError.notFound("Game session not found");
  }

  if (session.status !== "ACTIVE") {
    throw AppError.badRequest("Game session is already completed");
  }

  const question = await prisma.quizQuestion.findUnique({
    where: { id: input.questionId },
    include: { options: true },
  });

  if (!question) {
    throw AppError.notFound("Quiz question not found");
  }

  const correctOption = question.options.find((option) => option.isCorrect);
  const isCorrect = Boolean(correctOption && correctOption.text === input.selectedText);
  const xpAwarded = isCorrect ? question.xpReward : 0;
  // calculateStars() is a threshold function over a cumulative correct-answer
  // count (>=3, >=6, >=10), so calling it with a single 0/1 value always
  // returned 0 here: stars were never actually awarded for a quiz answer.
  // Match the memory-verse flow instead, with 1 star per correct answer.
  const starsAwarded = isCorrect ? 1 : 0;
  const nextXp = session.player.xp + xpAwarded;
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
      totalGamesPlayed: session.player.totalGamesPlayed + (session.correctCount + session.incorrectCount + 1 >= session.totalQuestions ? 1 : 0),
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
      xpAwarded,
      metadata: { correctText: correctOption?.text ?? null },
    },
  });

  const totalAnswered = session.correctCount + session.incorrectCount + 1;
  const isComplete = totalAnswered >= session.totalQuestions;

  const completedSession = await prisma.gameSession.update({
    where: { id: session.id },
    data: {
      correctCount: nextCorrect,
      incorrectCount: nextIncorrect,
      xpEarned: session.xpEarned + xpAwarded,
      starsEarned: session.starsEarned + starsAwarded,
      currentQuestion: totalAnswered,
      score: session.score + (isCorrect ? 100 : 0),
      status: isComplete ? "COMPLETED" : "ACTIVE",
      completedAt: isComplete ? new Date() : null,
    },
  });

  const rewards = await awardProgressRewards(updatedPlayer.id);

  await prisma.playerProgressLog.create({
    data: {
      playerId: updatedPlayer.id,
      actionType: isCorrect ? "QUIZ_CORRECT" : "QUIZ_INCORRECT",
      xpDelta: xpAwarded,
      starsDelta: starsAwarded,
      streakDelta: isCorrect ? 1 : 0,
      metadata: { sessionId: completedSession.id, questionId: question.id, answerId: answer.id },
    },
  });

  return {
    session: completedSession,
    player: updatedPlayer,
    answer,
    rewards,
    result: {
      isCorrect,
      xpAwarded,
      starsAwarded,
      correctText: correctOption?.text ?? null,
      isComplete,
    },
  };
}

export async function getPlayerProgress(playerId: string) {
  const player = await prisma.playerProfile.findUnique({
    where: { id: playerId },
    include: {
      badges: { include: { badge: true }, orderBy: { unlockedAt: "desc" } },
      avatarUnlocks: { include: { avatarItem: true }, orderBy: { unlockedAt: "desc" } },
    },
  });

  if (!player) {
    throw AppError.notFound("Player profile not found");
  }

  const rewards = await awardProgressRewards(playerId);

  return {
    player,
    computed: {
      level: calculateLevel(player.xp),
      stars: player.stars,
      streakDays: player.streakDays,
    },
    rewards,
    unlocked: {
      badges: player.badges,
      avatars: player.avatarUnlocks,
    },
  };
}

export async function startMemoryVerseSession(input: { playerId: string; categorySlug?: string; difficultySlug?: string; verseCount: number }) {
  const player = await prisma.playerProfile.findUnique({ where: { id: input.playerId } });

  if (!player) {
    throw AppError.notFound("Player profile not found");
  }

  const verses = await prisma.bibleVerse.findMany({
    where: {
      isActive: true,
      ...(input.categorySlug ? { category: { slug: input.categorySlug } } : {}),
      ...(input.difficultySlug ? { difficulty: { slug: input.difficultySlug } } : {}),
    },
    include: { category: true, difficulty: true },
    take: input.verseCount,
    orderBy: { createdAt: "desc" },
  });

  if (verses.length === 0) {
    throw AppError.notFound("No Bible verses available for the requested filters");
  }

  const session = await prisma.gameSession.create({
    data: {
      playerId: player.id,
      gameMode: "memory_verse",
      totalQuestions: verses.length,
      metadata: {
        categorySlug: input.categorySlug ?? null,
        difficultySlug: input.difficultySlug ?? null,
      },
    },
  });

  return {
    session,
    verses: verses.map((verse) => ({
      id: verse.id,
      slug: verse.slug,
      reference: verse.reference,
      text: verse.text,
      translation: verse.translation,
      memoryHint: verse.memoryHint,
      imageUrl: verse.imageUrl,
      imageAlt: verse.imageAlt,
      xpReward: verse.xpReward,
      category: verse.category,
      difficulty: verse.difficulty,
    })),
  };
}

export async function submitMemoryVerseAnswer(input: { sessionId: string; verseId: string; answerText: string }) {
  const session = await prisma.gameSession.findUnique({
    where: { id: input.sessionId },
    include: { player: true },
  });

  if (!session) {
    throw AppError.notFound("Game session not found");
  }

  if (session.status !== "ACTIVE") {
    throw AppError.badRequest("Game session is already completed");
  }

  const verse = await prisma.bibleVerse.findUnique({ where: { id: input.verseId } });

  if (!verse) {
    throw AppError.notFound("Bible verse not found");
  }

  const isCorrect = normalizeText(verse.text) === normalizeText(input.answerText);
  const xpAwarded = isCorrect ? verse.xpReward : 0;
  const starsAwarded = isCorrect ? 1 : 0;
  const nextXp = session.player.xp + xpAwarded;
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
      totalGamesPlayed: session.player.totalGamesPlayed + (session.correctCount + session.incorrectCount + 1 >= session.totalQuestions ? 1 : 0),
      totalCorrect: session.player.totalCorrect + (isCorrect ? 1 : 0),
      totalIncorrect: session.player.totalIncorrect + (isCorrect ? 0 : 1),
    },
  });

  const answer = await prisma.gameSessionAnswer.create({
    data: {
      sessionId: session.id,
      questionId: verse.id,
      selectedText: input.answerText,
      isCorrect,
      xpAwarded,
      metadata: { correctText: verse.text },
    },
  });

  const totalAnswered = session.correctCount + session.incorrectCount + 1;
  const isComplete = totalAnswered >= session.totalQuestions;

  const completedSession = await prisma.gameSession.update({
    where: { id: session.id },
    data: {
      correctCount: nextCorrect,
      incorrectCount: nextIncorrect,
      xpEarned: session.xpEarned + xpAwarded,
      starsEarned: session.starsEarned + starsAwarded,
      currentQuestion: totalAnswered,
      score: session.score + (isCorrect ? 100 : 0),
      status: isComplete ? "COMPLETED" : "ACTIVE",
      completedAt: isComplete ? new Date() : null,
    },
  });

  const rewards = await awardProgressRewards(updatedPlayer.id);

  await prisma.playerProgressLog.create({
    data: {
      playerId: updatedPlayer.id,
      actionType: isCorrect ? "MEMORY_VERSE_CORRECT" : "MEMORY_VERSE_INCORRECT",
      xpDelta: xpAwarded,
      starsDelta: starsAwarded,
      streakDelta: isCorrect ? 1 : 0,
      metadata: { sessionId: completedSession.id, verseId: verse.id, answerId: answer.id },
    },
  });

  return {
    session: completedSession,
    player: updatedPlayer,
    answer,
    rewards,
    result: {
      isCorrect,
      xpAwarded,
      starsAwarded,
      correctText: verse.text,
      isComplete,
    },
  };
}