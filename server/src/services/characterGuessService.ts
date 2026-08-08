import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { applyPlayerReward, awardProgressRewards, logProgress } from "./rewardService";
import { isContentUnlocked, listLevels, markCompleteAndUnlockNext, recordAttempt } from "./contentProgressService";

const GAME_MODE = "character_guess";
const DEFAULT_ROUND_COUNT = 5;
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

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

// Serves characters in sortOrder (authored roughly easiest/most well-known
// first) and skips ones this player has already guessed correctly, so
// rounds naturally get more obscure as they play more. Wraps around to
// already-solved characters once everything has been guessed at least once,
// so a round always has content to offer.
async function pickNextCharacters(playerId: string, roundCount: number) {
  const allCharacters = await prisma.bibleCharacter.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (allCharacters.length === 0) return [];

  const correctAnswers = await prisma.gameSessionAnswer.findMany({
    where: { isCorrect: true, session: { gameMode: "character_guess", playerId } },
    select: { questionId: true },
  });
  const solvedIds = new Set(correctAnswers.map((answer) => answer.questionId).filter(Boolean) as string[]);

  const unsolved = allCharacters.filter((character) => !solvedIds.has(character.id));
  const ordered = [...unsolved, ...allCharacters.filter((character) => solvedIds.has(character.id))];

  return ordered.slice(0, roundCount);
}

async function levelItems() {
  const characters = await prisma.bibleCharacter.findMany({ where: { isActive: true } });
  return characters.map((character) => ({ id: character.id, slug: character.slug, title: character.name, sortOrder: character.sortOrder }));
}

export async function listCharacterGuessLevels(playerId: string) {
  return listLevels(playerId, GAME_MODE, await levelItems());
}

export async function startCharacterGuessSession(input: { playerId: string; roundCount?: number; characterSlug?: string }) {
  const player = await prisma.playerProfile.findUnique({ where: { id: input.playerId } });
  if (!player) throw AppError.notFound("Player profile not found");

  let characters;
  let levelInfo: { levelNumber: number; maxLevel: number } | null = null;

  if (input.characterSlug) {
    const character = await prisma.bibleCharacter.findUnique({ where: { slug: input.characterSlug } });
    if (!character || !character.isActive) throw AppError.notFound("Character not found");

    const items = await levelItems();
    const unlocked = await isContentUnlocked(player.id, GAME_MODE, character.id, items);
    if (!unlocked) throw AppError.forbidden("Complete the previous level to unlock this one");

    await recordAttempt(player.id, GAME_MODE, character.id);
    levelInfo = {
      levelNumber: [...items].sort((a, b) => a.sortOrder - b.sortOrder).findIndex((item) => item.id === character.id) + 1,
      maxLevel: items.length,
    };
    characters = [character];
  } else {
    const roundCount = Math.min(Math.max(input.roundCount ?? DEFAULT_ROUND_COUNT, 1), 10);
    characters = await pickNextCharacters(input.playerId, roundCount);
  }

  if (characters.length === 0) {
    throw AppError.notFound("No characters available yet");
  }

  const session = await prisma.gameSession.create({
    data: {
      playerId: player.id,
      gameMode: "character_guess",
      totalQuestions: characters.length,
      metadata: input.characterSlug ? { levelCharacterId: characters[0].id } : {},
    },
  });

  return {
    session,
    levelNumber: levelInfo?.levelNumber ?? null,
    maxLevel: levelInfo?.maxLevel ?? null,
    rounds: shuffle(characters).map((character) => ({
      characterId: character.id,
      firstClue: character.clues[0] ?? "A figure from the Bible.",
      imageUrl: character.imageUrl,
    })),
  };
}

export async function requestCharacterHint(input: { sessionId: string; characterId: string }) {
  const session = await prisma.gameSession.findUnique({ where: { id: input.sessionId } });
  if (!session || session.gameMode !== "character_guess") throw AppError.notFound("Character guess session not found");
  if (session.status !== "ACTIVE") throw AppError.badRequest("This session has already ended");

  const existingAnswer = await prisma.gameSessionAnswer.findFirst({
    where: { sessionId: session.id, questionId: input.characterId },
  });
  if (existingAnswer) throw AppError.badRequest("This round has already been answered");

  const hintsUsed = await prisma.gameSessionHint.count({ where: { sessionId: session.id, questionId: input.characterId } });
  if (hintsUsed >= MAX_HINTS) throw AppError.badRequest("No hints left for this character");

  const character = await prisma.bibleCharacter.findUnique({ where: { id: input.characterId } });
  if (!character) throw AppError.notFound("Character not found");

  const hintNumber = hintsUsed + 1;
  const nextClue = character.clues[hintNumber] ?? character.clues[character.clues.length - 1] ?? null;

  await prisma.gameSessionHint.create({ data: { sessionId: session.id, questionId: input.characterId, hintNumber } });

  return {
    hintNumber,
    clue: nextClue,
    hintsRemaining: MAX_HINTS - hintNumber,
    maxPointsIfCorrect: Math.max(POINTS - hintNumber * POINTS_PER_HINT, 0),
  };
}

export async function submitCharacterGuess(input: { sessionId: string; characterId: string; guess: string }) {
  const session = await prisma.gameSession.findUnique({ where: { id: input.sessionId }, include: { player: true } });
  if (!session || session.gameMode !== "character_guess") throw AppError.notFound("Character guess session not found");
  if (session.status !== "ACTIVE") throw AppError.badRequest("This session has already ended");

  const character = await prisma.bibleCharacter.findUnique({ where: { id: input.characterId } });
  if (!character) throw AppError.notFound("Character not found");

  const hintsUsed = await prisma.gameSessionHint.count({ where: { sessionId: session.id, questionId: input.characterId } });
  const isCorrect = normalizeName(input.guess) === normalizeName(character.name);
  const pointsEarned = isCorrect ? Math.max(POINTS - hintsUsed * POINTS_PER_HINT, 0) : 0;
  const starsAwarded = isCorrect && hintsUsed === 0 ? 1 : 0;

  const nextCorrect = session.correctCount + (isCorrect ? 1 : 0);
  const nextIncorrect = session.incorrectCount + (isCorrect ? 0 : 1);

  const updatedPlayer = await applyPlayerReward(session.playerId, {
    xpDelta: pointsEarned,
    starsDelta: starsAwarded,
    isCorrect,
    countsAsGamePlayed: nextCorrect + nextIncorrect >= session.totalQuestions,
  });

  await prisma.gameSessionAnswer.create({
    data: {
      sessionId: session.id,
      questionId: character.id,
      selectedText: input.guess,
      isCorrect,
      xpAwarded: pointsEarned,
      metadata: { correctName: character.name, hintsUsed },
    },
  });

  const totalAnswered = nextCorrect + nextIncorrect;
  const isComplete = totalAnswered >= session.totalQuestions;

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
  const levelCharacterId = (session.metadata as { levelCharacterId?: string } | null)?.levelCharacterId;

  if (isComplete && isCorrect && levelCharacterId) {
    const unlockResult = await markCompleteAndUnlockNext(
      updatedPlayer.id,
      GAME_MODE,
      levelCharacterId,
      completedSession.score,
      await levelItems(),
    );
    nextLevelSlug = unlockResult.nextSlug;
  }

  const rewards = await awardProgressRewards(updatedPlayer.id);
  await logProgress({
    playerId: updatedPlayer.id,
    actionType: isCorrect ? "CHARACTER_GUESS_CORRECT" : "CHARACTER_GUESS_INCORRECT",
    xpDelta: pointsEarned,
    starsDelta: starsAwarded,
    streakDelta: isCorrect ? 1 : 0,
    metadata: { sessionId: completedSession.id, characterId: character.id, hintsUsed },
  });

  return {
    session: completedSession,
    player: updatedPlayer,
    rewards,
    result: { isCorrect, pointsEarned, hintsUsed, correctName: character.name, isComplete, nextLevelSlug },
  };
}
