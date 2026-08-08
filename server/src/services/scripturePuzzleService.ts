import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { applyPlayerReward, awardProgressRewards, logProgress } from "./rewardService";
import { isContentUnlocked, listLevels, markCompleteAndUnlockNext, recordAttempt } from "./contentProgressService";
import { abandonSession, answeredItemIds, findActiveLevelSession } from "./sessionResumeService";

const GAME_MODE = "scripture_puzzle";
const POINTS = 10;
const POINTS_PER_HINT = 2;
const MAX_HINTS = 2;
// Levels reuse the same 8 categories Bible Quiz Levels and Character Guess
// use (categories with no verses are skipped). Each level pulls up to this
// many verses from its category -- real, multi-verse work to unlock the
// next level rather than solving a single puzzle.
const MAX_VERSES_PER_LEVEL = 20;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function splitVerseWords(text: string): string[] {
  return text.trim().split(/\s+/);
}

function normalizeAnswer(words: string[]): string {
  return words.join(" ").trim().toLowerCase().replace(/\s+/g, " ");
}

// Serves a single verse shortest-first (a reasonable proxy for puzzle
// difficulty) and skips verses this player has already solved -- used only
// for the legacy non-level "quick practice" path (no categorySlug given).
async function pickNextVerse(playerId: string) {
  const allVerses = await prisma.bibleVerse.findMany({ where: { isActive: true } });
  if (allVerses.length === 0) return null;

  const sortedByDifficulty = [...allVerses].sort((a, b) => a.text.length - b.text.length);

  const completedSessions = await prisma.gameSession.findMany({
    where: { playerId, gameMode: "scripture_puzzle", status: "COMPLETED" },
    select: { metadata: true },
  });

  const completedVerseIds = new Set(
    completedSessions
      .map((session) => (session.metadata as { verseId?: string } | null)?.verseId)
      .filter((id): id is string => Boolean(id)),
  );

  const next = sortedByDifficulty.find((verse) => !completedVerseIds.has(verse.id));
  if (next) return next;

  return allVerses[Math.floor(Math.random() * allVerses.length)];
}

// Levels = categories that actually have at least one verse.
async function levelCategories() {
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  const counts = await prisma.bibleVerse.groupBy({
    by: ["categoryId"],
    where: { isActive: true, categoryId: { not: null } },
    _count: true,
  });
  const countByCategory = new Map(counts.map((row) => [row.categoryId, row._count]));
  return categories.filter((category) => (countByCategory.get(category.id) ?? 0) > 0);
}

async function levelItems() {
  const categories = await levelCategories();
  return categories.map((category) => ({ id: category.id, slug: category.slug, title: category.name, sortOrder: category.sortOrder }));
}

async function versesForCategory(categoryId: string) {
  return prisma.bibleVerse.findMany({
    where: { isActive: true, categoryId },
    orderBy: { sortOrder: "asc" },
    take: MAX_VERSES_PER_LEVEL,
  });
}

export async function listScripturePuzzleLevels(playerId: string) {
  return listLevels(playerId, GAME_MODE, await levelItems());
}

export async function startScripturePuzzleSession(input: { playerId: string; categorySlug?: string; restart?: boolean }) {
  const player = await prisma.playerProfile.findUnique({ where: { id: input.playerId } });
  if (!player) throw AppError.notFound("Player profile not found");

  let verses;
  let levelInfo: { levelNumber: number; maxLevel: number } | null = null;
  let levelAnchorId: string | null = null;
  let resumedSession: Awaited<ReturnType<typeof findActiveLevelSession>> = null;

  if (input.categorySlug) {
    const categories = await levelCategories();
    const categoryIndex = categories.findIndex((category) => category.slug === input.categorySlug);
    if (categoryIndex === -1) throw AppError.notFound("Level not found");

    const category = categories[categoryIndex];
    const items = await levelItems();
    const unlocked = await isContentUnlocked(player.id, GAME_MODE, category.id, items);
    if (!unlocked) throw AppError.forbidden("Complete the previous level to unlock this one");

    levelInfo = { levelNumber: categoryIndex + 1, maxLevel: categories.length };
    levelAnchorId = category.id;
    verses = await versesForCategory(category.id);

    const existing = await findActiveLevelSession(player.id, GAME_MODE, "levelCategoryId", category.id);
    if (existing) {
      if (input.restart) {
        await abandonSession(existing.id);
      } else {
        const answeredIds = await answeredItemIds(existing.id);
        const remaining = verses.filter((verse) => !answeredIds.has(verse.id));
        if (remaining.length > 0) {
          resumedSession = existing;
          verses = remaining;
        }
      }
    }

    if (!resumedSession) {
      await recordAttempt(player.id, GAME_MODE, category.id);
    }
  } else {
    const verse = await pickNextVerse(input.playerId);
    verses = verse ? [verse] : [];
  }

  if (verses.length === 0) {
    throw AppError.notFound("No verses available for a puzzle yet");
  }

  const session =
    resumedSession ??
    (await prisma.gameSession.create({
      data: {
        playerId: player.id,
        gameMode: "scripture_puzzle",
        totalQuestions: verses.length,
        metadata: levelAnchorId ? { levelCategoryId: levelAnchorId } : {},
      },
    }));

  return {
    session,
    levelNumber: levelInfo?.levelNumber ?? null,
    maxLevel: levelInfo?.maxLevel ?? null,
    resumed: Boolean(resumedSession),
    verses: shuffle(verses).map((verse) => ({
      id: verse.id,
      slug: verse.slug,
      reference: verse.reference,
      scrambledWords: shuffle(splitVerseWords(verse.text)),
    })),
  };
}

export async function requestScripturePuzzleHint(input: { sessionId: string; verseId: string }) {
  const session = await prisma.gameSession.findUnique({ where: { id: input.sessionId } });
  if (!session || session.gameMode !== "scripture_puzzle") throw AppError.notFound("Puzzle session not found");
  if (session.status !== "ACTIVE") throw AppError.badRequest("This puzzle session has already ended");

  const existingAnswer = await prisma.gameSessionAnswer.findFirst({
    where: { sessionId: session.id, questionId: input.verseId },
  });
  if (existingAnswer) throw AppError.badRequest("This verse has already been answered");

  const hintsUsed = await prisma.gameSessionHint.count({ where: { sessionId: session.id, questionId: input.verseId } });
  if (hintsUsed >= MAX_HINTS) throw AppError.badRequest("No hints left for this puzzle");

  const verse = await prisma.bibleVerse.findUnique({ where: { id: input.verseId } });
  if (!verse) throw AppError.notFound("Verse not found");

  const words = splitVerseWords(verse.text);
  const hintNumber = hintsUsed + 1;
  const revealedPosition = hintNumber - 1;
  const revealedWord = words[revealedPosition] ?? null;

  await prisma.gameSessionHint.create({
    data: { sessionId: session.id, questionId: input.verseId, hintNumber },
  });

  return {
    hintNumber,
    revealedPosition,
    revealedWord,
    hintsRemaining: MAX_HINTS - hintNumber,
    maxPointsIfCorrect: Math.max(POINTS - hintNumber * POINTS_PER_HINT, 0),
  };
}

export async function submitScripturePuzzleAnswer(input: { sessionId: string; verseId: string; orderedWords: string[] }) {
  const session = await prisma.gameSession.findUnique({ where: { id: input.sessionId }, include: { player: true } });
  if (!session || session.gameMode !== "scripture_puzzle") throw AppError.notFound("Puzzle session not found");
  if (session.status !== "ACTIVE") throw AppError.badRequest("This puzzle session has already ended");

  const verse = await prisma.bibleVerse.findUnique({ where: { id: input.verseId } });
  if (!verse) throw AppError.notFound("Verse not found");

  const hintsUsed = await prisma.gameSessionHint.count({ where: { sessionId: session.id, questionId: input.verseId } });
  const isCorrect = normalizeAnswer(input.orderedWords) === normalizeAnswer(splitVerseWords(verse.text));
  const pointsEarned = isCorrect ? Math.max(POINTS - hintsUsed * POINTS_PER_HINT, 0) : 0;
  const starsAwarded = isCorrect && hintsUsed === 0 ? 1 : 0;

  const nextCorrect = session.correctCount + (isCorrect ? 1 : 0);
  const nextIncorrect = session.incorrectCount + (isCorrect ? 0 : 1);
  const totalAnswered = nextCorrect + nextIncorrect;
  const isComplete = totalAnswered >= session.totalQuestions;

  const updatedPlayer = await applyPlayerReward(session.playerId, {
    xpDelta: pointsEarned,
    starsDelta: starsAwarded,
    isCorrect,
    countsAsGamePlayed: isComplete,
  });

  await prisma.gameSessionAnswer.create({
    data: {
      sessionId: session.id,
      questionId: verse.id,
      selectedText: input.orderedWords.join(" "),
      isCorrect,
      xpAwarded: pointsEarned,
      metadata: { correctText: verse.text, hintsUsed },
    },
  });

  const completedSession = await prisma.gameSession.update({
    where: { id: session.id },
    data: {
      correctCount: nextCorrect,
      incorrectCount: nextIncorrect,
      xpEarned: session.xpEarned + pointsEarned,
      starsEarned: session.starsEarned + starsAwarded,
      currentQuestion: totalAnswered,
      score: session.score + pointsEarned,
      status: isComplete ? "COMPLETED" : "ACTIVE",
      completedAt: isComplete ? new Date() : null,
    },
  });

  let nextLevelSlug: string | null = null;
  const levelCategoryId = (session.metadata as { levelCategoryId?: string } | null)?.levelCategoryId;
  const allCorrectInLevel = nextCorrect === session.totalQuestions;

  if (isComplete && allCorrectInLevel && levelCategoryId) {
    const unlockResult = await markCompleteAndUnlockNext(
      updatedPlayer.id,
      GAME_MODE,
      levelCategoryId,
      completedSession.score,
      await levelItems(),
    );
    nextLevelSlug = unlockResult.nextSlug;
  }

  const rewards = isComplete ? await awardProgressRewards(updatedPlayer.id) : { badgesUnlocked: [], avatarsUnlocked: [] };
  await logProgress({
    playerId: updatedPlayer.id,
    actionType: isCorrect ? "SCRIPTURE_PUZZLE_CORRECT" : "SCRIPTURE_PUZZLE_INCORRECT",
    xpDelta: pointsEarned,
    starsDelta: starsAwarded,
    streakDelta: isCorrect ? 1 : 0,
    metadata: { sessionId: completedSession.id, verseId: verse.id, hintsUsed },
  });

  return {
    session: completedSession,
    player: updatedPlayer,
    rewards,
    result: { isCorrect, pointsEarned, hintsUsed, correctText: verse.text, isComplete, nextLevelSlug },
  };
}
