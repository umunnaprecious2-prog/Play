import type { Prisma } from "@prisma/client";
import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { calculateLevel, updateStreak } from "../utils/gameMath";
import { awardProgressRewards } from "./rewardService";

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

// Picks `count` random question ids from everything matching `where`,
// preferring ids the player hasn't answered recently so the same round
// doesn't keep resurfacing. Falls back to the full pool (repeats allowed)
// only once there genuinely aren't enough unseen questions left -- e.g. a
// low-difficulty filter with a small pool, or a player who has worked
// through most of it.
async function pickRandomQuestionIds(input: {
  where: Prisma.QuizQuestionWhereInput;
  count: number;
  excludeIds: Set<string>;
}): Promise<string[]> {
  const rows = await prisma.quizQuestion.findMany({ where: input.where, select: { id: true } });
  const allIds = rows.map((row) => row.id);
  const freshIds = allIds.filter((id) => !input.excludeIds.has(id));
  const pool = freshIds.length >= input.count ? freshIds : allIds;

  return shuffle(pool).slice(0, input.count);
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

  const where: Prisma.QuizQuestionWhereInput = {
    isActive: true,
    ...(input.categorySlug ? { category: { slug: input.categorySlug } } : {}),
    ...(input.difficultySlug ? { difficulty: { slug: input.difficultySlug } } : {}),
  };

  // Previously this always took the same `questionCount` most-recently-created
  // questions (orderBy createdAt desc), so every Quick Practice/Trivia session
  // showed the identical fixed set regardless of how many hundreds of
  // questions actually exist -- the repetition the user reported in QA.
  // Fixed by randomly sampling from the whole filtered pool, and preferring
  // questions this player hasn't answered recently (last 300 quiz answers).
  const recentAnswers = await prisma.gameSessionAnswer.findMany({
    where: { session: { playerId: input.playerId, gameMode: "quiz" } },
    select: { questionId: true },
    orderBy: { answeredAt: "desc" },
    take: 300,
  });
  const recentlySeenIds = new Set(
    recentAnswers.map((row) => row.questionId).filter((id): id is string => Boolean(id)),
  );

  const chosenIds = await pickRandomQuestionIds({ where, count: input.questionCount, excludeIds: recentlySeenIds });

  if (chosenIds.length === 0) {
    throw AppError.notFound("No quiz questions available for the requested filters");
  }

  const orderIndex = new Map(chosenIds.map((id, index) => [id, index]));
  const questions = (
    await prisma.quizQuestion.findMany({
      where: { id: { in: chosenIds } },
      include: { options: { orderBy: { sortOrder: "asc" } }, category: true, difficulty: true },
    })
  ).sort((a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0));

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

  const totalAnswered = session.correctCount + session.incorrectCount + 1;
  const isComplete = totalAnswered >= session.totalQuestions;

  // These three writes touch different rows (player, answer, session) and
  // none of them reads another's result, so they don't need to happen one
  // at a time -- previously sequential, which added three full round trips
  // to every answer submission for no reason.
  const [updatedPlayer, answer, completedSession] = await Promise.all([
    prisma.playerProfile.update({
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
    }),
    prisma.gameSessionAnswer.create({
      data: {
        sessionId: session.id,
        questionId: question.id,
        selectedText: input.selectedText,
        isCorrect,
        xpAwarded,
        metadata: { correctText: correctOption?.text ?? null },
      },
    }),
    prisma.gameSession.update({
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
    }),
  ]);

  // Reward evaluation and the progress-log write are independent of each
  // other too.
  const [rewards] = await Promise.all([
    awardProgressRewards(updatedPlayer.id, updatedPlayer),
    prisma.playerProgressLog.create({
      data: {
        playerId: updatedPlayer.id,
        actionType: isCorrect ? "QUIZ_CORRECT" : "QUIZ_INCORRECT",
        xpDelta: xpAwarded,
        starsDelta: starsAwarded,
        streakDelta: isCorrect ? 1 : 0,
        metadata: { sessionId: completedSession.id, questionId: question.id, answerId: answer.id },
      },
    }),
  ]);

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

  const rewards = await awardProgressRewards(playerId, player);

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

const MEMORY_VERSE_VERSES_PER_LEVEL = 20;
const MEMORY_VERSE_MAX_LEVEL = 10;

// Same level-map shape as getTriviaLevelMap / getVerseMatchLevelMap /
// getFlashCardLevelMap -- backs the snake-ladder ProceduralLevelMap page for
// Memory Verse (/memory-verse now shows the map, gameplay moved to
// /memory-verse/play).
export async function getMemoryVerseLevelMap(playerId: string) {
  const completedCount = await prisma.gameSession.count({
    where: { playerId, gameMode: "memory_verse", status: "COMPLETED" },
  });
  return { currentLevel: Math.min(completedCount + 1, MEMORY_VERSE_MAX_LEVEL), maxLevel: MEMORY_VERSE_MAX_LEVEL };
}

// Memory Verse's level is derived the same way as Match the Verse / Flash
// Cards: how many rounds this player has already completed, capped at the
// max level. 10 levels x 20 verses/level = the full 200-verse memory-verse
// pool getting used across a full playthrough. Every level always serves a
// full 20 verses -- difficulty still escalates across the 10 levels via
// which verses are drawn from (shortest/easiest first), never by giving
// fewer verses. Mirrors verseMatchService's pickLevelVerses / flashCardService's
// pickLevelDeck pattern.
async function pickMemoryVerseLevel(input: {
  playerId: string;
  categorySlug?: string;
  difficultySlug?: string;
  requestedVerseCount?: number;
}) {
  const completedCount = await prisma.gameSession.count({
    where: { playerId: input.playerId, gameMode: "memory_verse", status: "COMPLETED" },
  });
  const level = Math.min(completedCount + 1, MEMORY_VERSE_MAX_LEVEL);

  const allVerses = await prisma.bibleVerse.findMany({
    where: {
      isActive: true,
      ...(input.categorySlug ? { category: { slug: input.categorySlug } } : {}),
      ...(input.difficultySlug ? { difficulty: { slug: input.difficultySlug } } : {}),
    },
    include: { category: true, difficulty: true },
  });
  const sortedByDifficulty = [...allVerses].sort((a, b) => a.text.length - b.text.length);

  const verseCount = Math.min(input.requestedVerseCount ?? MEMORY_VERSE_VERSES_PER_LEVEL, allVerses.length);

  // The difficulty window must always contain at least verseCount verses, or
  // a low level would silently serve fewer than 20 despite verseCount saying
  // 20 -- the same bug already fixed for Match the Verse and Flash Cards.
  const minWindow = Math.max(verseCount, MEMORY_VERSE_VERSES_PER_LEVEL);
  const windowSize = Math.min(
    allVerses.length,
    minWindow + Math.floor(((level - 1) * Math.max(allVerses.length - minWindow, 0)) / (MEMORY_VERSE_MAX_LEVEL - 1)),
  );
  const pool = sortedByDifficulty.slice(0, windowSize);

  return { level, verses: shuffle(pool).slice(0, verseCount) };
}

export async function startMemoryVerseSession(input: {
  playerId: string;
  categorySlug?: string;
  difficultySlug?: string;
  verseCount?: number;
}) {
  const player = await prisma.playerProfile.findUnique({ where: { id: input.playerId } });

  if (!player) {
    throw AppError.notFound("Player profile not found");
  }

  const { level, verses } = await pickMemoryVerseLevel({
    playerId: input.playerId,
    categorySlug: input.categorySlug,
    difficultySlug: input.difficultySlug,
    requestedVerseCount: input.verseCount,
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
        level,
      },
    },
  });

  return {
    session,
    level,
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

  const totalAnswered = session.correctCount + session.incorrectCount + 1;
  const isComplete = totalAnswered >= session.totalQuestions;

  const [updatedPlayer, answer, completedSession] = await Promise.all([
    prisma.playerProfile.update({
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
    }),
    prisma.gameSessionAnswer.create({
      data: {
        sessionId: session.id,
        questionId: verse.id,
        selectedText: input.answerText,
        isCorrect,
        xpAwarded,
        metadata: { correctText: verse.text },
      },
    }),
    prisma.gameSession.update({
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
    }),
  ]);

  const [rewards] = await Promise.all([
    awardProgressRewards(updatedPlayer.id, updatedPlayer),
    prisma.playerProgressLog.create({
      data: {
        playerId: updatedPlayer.id,
        actionType: isCorrect ? "MEMORY_VERSE_CORRECT" : "MEMORY_VERSE_INCORRECT",
        xpDelta: xpAwarded,
        starsDelta: starsAwarded,
        streakDelta: isCorrect ? 1 : 0,
        metadata: { sessionId: completedSession.id, verseId: verse.id, answerId: answer.id },
      },
    }),
  ]);

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