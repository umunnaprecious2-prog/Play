import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { applyPlayerReward, awardProgressRewards, logProgress } from "./rewardService";
import { isContentUnlocked, listLevels, markCompleteAndUnlockNext, recordAttempt } from "./contentProgressService";

const GAME_MODE = "scripture_puzzle";
const POINTS = 10;
const POINTS_PER_HINT = 2;
const MAX_HINTS = 2;

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

// Serves verses shortest-first (a reasonable proxy for puzzle difficulty,
// since fewer words to reorder is easier) and skips verses this player has already
// solved, so the puzzle naturally gets harder as they progress. Falls back
// to a random pick once everything has been solved at least once.
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

// Difficulty proxy items for the level map: sortOrder here is derived from
// verse text length (shorter = easier), matching pickNextVerse's existing
// difficulty ordering, rather than BibleVerse's stored sortOrder field
// (which reflects authoring/category order, not puzzle difficulty).
async function levelItems() {
  const verses = await prisma.bibleVerse.findMany({ where: { isActive: true } });
  return verses.map((verse) => ({ id: verse.id, slug: verse.slug, title: verse.reference, sortOrder: verse.text.length }));
}

export async function listScripturePuzzleLevels(playerId: string) {
  return listLevels(playerId, GAME_MODE, await levelItems());
}

export async function startScripturePuzzleSession(input: { playerId: string; verseSlug?: string }) {
  const player = await prisma.playerProfile.findUnique({ where: { id: input.playerId } });
  if (!player) throw AppError.notFound("Player profile not found");

  const verse = input.verseSlug
    ? await prisma.bibleVerse.findUnique({ where: { slug: input.verseSlug } })
    : await pickNextVerse(input.playerId);
  if (!verse || !verse.isActive) throw AppError.notFound("No verses available for a puzzle yet");

  const items = await levelItems();
  const levelNumber = [...items].sort((a, b) => a.sortOrder - b.sortOrder).findIndex((item) => item.id === verse.id) + 1;

  if (input.verseSlug) {
    const unlocked = await isContentUnlocked(player.id, GAME_MODE, verse.id, items);
    if (!unlocked) throw AppError.forbidden("Complete the previous level to unlock this one");
    await recordAttempt(player.id, GAME_MODE, verse.id);
  }

  const session = await prisma.gameSession.create({
    data: { playerId: player.id, gameMode: "scripture_puzzle", totalQuestions: 1, metadata: { verseId: verse.id } },
  });

  return {
    session,
    verse: { id: verse.id, slug: verse.slug, reference: verse.reference },
    levelNumber,
    maxLevel: items.length,
    scrambledWords: shuffle(splitVerseWords(verse.text)),
  };
}

export async function requestScripturePuzzleHint(input: { sessionId: string; verseId: string }) {
  const session = await prisma.gameSession.findUnique({ where: { id: input.sessionId } });
  if (!session || session.gameMode !== "scripture_puzzle") throw AppError.notFound("Puzzle session not found");
  if (session.status !== "ACTIVE") throw AppError.badRequest("This puzzle session has already ended");

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

  const updatedPlayer = await applyPlayerReward(session.playerId, {
    xpDelta: pointsEarned,
    starsDelta: starsAwarded,
    isCorrect,
    countsAsGamePlayed: true,
  });

  const completedSession = await prisma.gameSession.update({
    where: { id: session.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      correctCount: isCorrect ? 1 : 0,
      incorrectCount: isCorrect ? 0 : 1,
      xpEarned: pointsEarned,
      starsEarned: starsAwarded,
      score: pointsEarned,
      currentQuestion: 1,
    },
  });

  let nextLevelSlug: string | null = null;

  if (isCorrect) {
    const unlockResult = await markCompleteAndUnlockNext(
      updatedPlayer.id,
      GAME_MODE,
      verse.id,
      completedSession.score,
      await levelItems(),
    );
    nextLevelSlug = unlockResult.nextSlug;
  }

  const rewards = await awardProgressRewards(updatedPlayer.id);
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
    result: { isCorrect, pointsEarned, hintsUsed, correctText: verse.text, isComplete: true, nextLevelSlug },
  };
}
