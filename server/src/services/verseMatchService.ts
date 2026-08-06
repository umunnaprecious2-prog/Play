import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { applyPlayerReward, awardProgressRewards, logProgress } from "./rewardService";

const DEFAULT_PAIR_COUNT = 6;
const POINTS_PER_PAIR = 10;
const MAX_LEVEL = 20;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

// Escalates difficulty over 20 levels using the existing verse pool — no new
// content needed. The level is derived from how many rounds this player has
// already completed, so pair count and verse difficulty both ramp up the
// more they play, then hold steady at the hardest tier.
async function pickLevelVerses(playerId: string, requestedPairCount?: number) {
  const completedCount = await prisma.gameSession.count({
    where: { playerId, gameMode: "verse_match", status: "COMPLETED" },
  });
  const level = Math.min(completedCount + 1, MAX_LEVEL);

  const allVerses = await prisma.bibleVerse.findMany({ where: { isActive: true } });
  const sortedByDifficulty = [...allVerses].sort((a, b) => a.text.length - b.text.length);

  const pairCount = requestedPairCount
    ? Math.min(Math.max(requestedPairCount, 3), 10)
    : Math.min(3 + Math.floor(((level - 1) * 7) / (MAX_LEVEL - 1)), 10, allVerses.length);

  const windowSize = Math.min(allVerses.length, 5 + level);
  const pool = sortedByDifficulty.slice(0, windowSize);

  return { level, verses: shuffle(pool).slice(0, pairCount) };
}

export async function startVerseMatchSession(input: { playerId: string; pairCount?: number }) {
  const player = await prisma.playerProfile.findUnique({ where: { id: input.playerId } });
  if (!player) throw AppError.notFound("Player profile not found");

  const { level, verses } = await pickLevelVerses(input.playerId, input.pairCount);

  if (verses.length < 3) {
    throw AppError.notFound("Not enough verses available for a match game yet");
  }

  const session = await prisma.gameSession.create({
    data: { playerId: player.id, gameMode: "verse_match", totalQuestions: verses.length, metadata: { level } },
  });

  const cards = shuffle(
    verses.flatMap((verse) => [
      { cardId: `${verse.id}-ref`, verseId: verse.id, type: "reference" as const, content: verse.reference },
      { cardId: `${verse.id}-text`, verseId: verse.id, type: "text" as const, content: verse.text },
    ]),
  );

  return { session, level, pairCount: verses.length, cards };
}

export async function completeVerseMatchSession(input: {
  sessionId: string;
  matchesFound: number;
  mistakeCount: number;
}) {
  const session = await prisma.gameSession.findUnique({ where: { id: input.sessionId }, include: { player: true } });
  if (!session) throw AppError.notFound("Game session not found");
  if (session.gameMode !== "verse_match") throw AppError.badRequest("Session is not a Match the Verse session");
  if (session.status !== "ACTIVE") throw AppError.badRequest("This session has already ended");

  const matchesFound = Math.min(Math.max(input.matchesFound, 0), session.totalQuestions);
  const isPerfect = matchesFound >= session.totalQuestions && input.mistakeCount === 0;
  const xpAwarded = matchesFound * POINTS_PER_PAIR;
  const starsAwarded = isPerfect ? 1 : 0;

  const updatedPlayer = await applyPlayerReward(session.playerId, {
    xpDelta: xpAwarded,
    starsDelta: starsAwarded,
    isCorrect: matchesFound === session.totalQuestions,
    countsAsGamePlayed: true,
  });

  const completedSession = await prisma.gameSession.update({
    where: { id: session.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      correctCount: matchesFound,
      incorrectCount: input.mistakeCount,
      xpEarned: xpAwarded,
      starsEarned: starsAwarded,
      score: xpAwarded,
      currentQuestion: session.totalQuestions,
    },
  });

  const rewards = await awardProgressRewards(updatedPlayer.id);
  await logProgress({
    playerId: updatedPlayer.id,
    actionType: "VERSE_MATCH_COMPLETE",
    xpDelta: xpAwarded,
    starsDelta: starsAwarded,
    streakDelta: 1,
    metadata: { sessionId: completedSession.id, matchesFound, mistakeCount: input.mistakeCount },
  });

  return { session: completedSession, player: updatedPlayer, rewards, result: { matchesFound, xpAwarded, starsAwarded, isPerfect } };
}
