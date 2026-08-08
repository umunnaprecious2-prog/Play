import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { applyPlayerReward, awardProgressRewards, logProgress } from "./rewardService";

const CARDS_PER_LEVEL = 20;
const POINTS_PER_KNOWN_CARD = 5;
const MAX_LEVEL = 20;

export async function getFlashCardLevelMap(playerId: string) {
  const completedCount = await prisma.gameSession.count({
    where: { playerId, gameMode: "flash_cards", status: "COMPLETED" },
  });
  return { currentLevel: Math.min(completedCount + 1, MAX_LEVEL), maxLevel: MAX_LEVEL };
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

// Every level always serves a full 20-card deck (matching every other
// game's 20-per-level standard) -- difficulty still escalates across the 20
// levels by leaning toward longer (harder) verses at higher levels, but
// never by handing out fewer cards.
async function pickLevelDeck(playerId: string, requestedDeckSize?: number) {
  const completedCount = await prisma.gameSession.count({
    where: { playerId, gameMode: "flash_cards", status: "COMPLETED" },
  });
  const level = Math.min(completedCount + 1, MAX_LEVEL);

  const allVerses = await prisma.bibleVerse.findMany({ where: { isActive: true } });
  const sortedByDifficulty = [...allVerses].sort((a, b) => a.text.length - b.text.length);

  const deckSize = Math.min(requestedDeckSize ?? CARDS_PER_LEVEL, allVerses.length);

  // The difficulty window must always contain at least deckSize verses, or a
  // low level would silently serve fewer than 20 cards despite deckSize
  // saying 20 -- exactly the bug this replaces.
  const minWindow = Math.max(deckSize, CARDS_PER_LEVEL);
  const windowSize = Math.min(
    allVerses.length,
    minWindow + Math.floor(((level - 1) * Math.max(allVerses.length - minWindow, 0)) / (MAX_LEVEL - 1)),
  );
  const pool = sortedByDifficulty.slice(0, windowSize);

  return { level, deck: shuffle(pool).slice(0, deckSize) };
}

export async function startFlashCardSession(input: { playerId: string; deckSize?: number }) {
  const player = await prisma.playerProfile.findUnique({ where: { id: input.playerId } });
  if (!player) throw AppError.notFound("Player profile not found");

  const { level, deck: verses } = await pickLevelDeck(input.playerId, input.deckSize);

  if (verses.length === 0) {
    throw AppError.notFound("No verses available for flash cards yet");
  }

  const session = await prisma.gameSession.create({
    data: { playerId: player.id, gameMode: "flash_cards", totalQuestions: verses.length, metadata: { level } },
  });

  const cards = shuffle(
    verses.map((verse) => ({
      id: verse.id,
      reference: verse.reference,
      text: verse.text,
      memoryHint: verse.memoryHint,
    })),
  );

  return { session, level, cards };
}

export async function completeFlashCardSession(input: { sessionId: string; knewCount: number }) {
  const session = await prisma.gameSession.findUnique({ where: { id: input.sessionId }, include: { player: true } });
  if (!session) throw AppError.notFound("Game session not found");
  if (session.gameMode !== "flash_cards") throw AppError.badRequest("Session is not a Flash Cards session");
  if (session.status !== "ACTIVE") throw AppError.badRequest("This session has already ended");

  const knewCount = Math.min(Math.max(input.knewCount, 0), session.totalQuestions);
  const xpAwarded = knewCount * POINTS_PER_KNOWN_CARD;
  const starsAwarded = knewCount >= session.totalQuestions ? 1 : 0;

  const updatedPlayer = await applyPlayerReward(session.playerId, {
    xpDelta: xpAwarded,
    starsDelta: starsAwarded,
    isCorrect: knewCount === session.totalQuestions,
    countsAsGamePlayed: true,
  });

  const completedSession = await prisma.gameSession.update({
    where: { id: session.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      correctCount: knewCount,
      incorrectCount: session.totalQuestions - knewCount,
      xpEarned: xpAwarded,
      starsEarned: starsAwarded,
      score: xpAwarded,
      currentQuestion: session.totalQuestions,
    },
  });

  const rewards = await awardProgressRewards(updatedPlayer.id);
  await logProgress({
    playerId: updatedPlayer.id,
    actionType: "FLASH_CARDS_COMPLETE",
    xpDelta: xpAwarded,
    starsDelta: starsAwarded,
    streakDelta: 1,
    metadata: { sessionId: completedSession.id, knewCount },
  });

  return { session: completedSession, player: updatedPlayer, rewards, result: { knewCount, xpAwarded, starsAwarded } };
}
