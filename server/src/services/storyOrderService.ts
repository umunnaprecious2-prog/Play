import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { applyPlayerReward, awardProgressRewards, logProgress } from "./rewardService";
import { isContentUnlocked, listLevels, markCompleteAndUnlockNext, recordAttempt } from "./contentProgressService";

const GAME_MODE = "story_order";
const POINTS = 10;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

// Serves stories in sortOrder (authored roughly simplest/most well-known
// first) and skips ones this player has already solved, so the challenge
// naturally gets harder as they progress. Falls back to a random pick once
// everything has been solved at least once.
async function pickNextStory(playerId: string) {
  const allStories = await prisma.bibleStory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  if (allStories.length === 0) return null;

  const completedSessions = await prisma.gameSession.findMany({
    where: { playerId, gameMode: "story_order", status: "COMPLETED" },
    select: { metadata: true },
  });
  const completedStoryIds = new Set(
    completedSessions
      .map((session) => (session.metadata as { storyId?: string } | null)?.storyId)
      .filter((id): id is string => Boolean(id)),
  );

  const next = allStories.find((story) => !completedStoryIds.has(story.id));
  const chosen = next ?? allStories[Math.floor(Math.random() * allStories.length)];

  return prisma.bibleStory.findUnique({
    where: { id: chosen.id },
    include: { events: { orderBy: { correctOrder: "asc" } } },
  });
}

async function levelItems() {
  const stories = await prisma.bibleStory.findMany({ where: { isActive: true } });
  return stories.map((story) => ({ id: story.id, slug: story.slug, title: story.title, sortOrder: story.sortOrder }));
}

export async function listStoryOrderLevels(playerId: string) {
  return listLevels(playerId, GAME_MODE, await levelItems());
}

export async function startStoryOrderSession(input: { playerId: string; storySlug?: string }) {
  const player = await prisma.playerProfile.findUnique({ where: { id: input.playerId } });
  if (!player) throw AppError.notFound("Player profile not found");

  const story = input.storySlug
    ? await prisma.bibleStory.findUnique({ where: { slug: input.storySlug }, include: { events: { orderBy: { correctOrder: "asc" } } } })
    : await pickNextStory(input.playerId);
  if (!story || story.events.length === 0) throw AppError.notFound("No stories available yet");

  const items = await levelItems();
  const levelNumber = [...items].sort((a, b) => a.sortOrder - b.sortOrder).findIndex((item) => item.id === story.id) + 1;

  if (input.storySlug) {
    const unlocked = await isContentUnlocked(player.id, GAME_MODE, story.id, items);
    if (!unlocked) throw AppError.forbidden("Complete the previous level to unlock this one");
    await recordAttempt(player.id, GAME_MODE, story.id);
  }

  const session = await prisma.gameSession.create({
    data: { playerId: player.id, gameMode: "story_order", totalQuestions: 1, metadata: { storyId: story.id } },
  });

  return {
    session,
    story: { id: story.id, slug: story.slug, title: story.title },
    levelNumber,
    maxLevel: items.length,
    shuffledEvents: shuffle(story.events.map((event) => ({ id: event.id, text: event.text }))),
  };
}

export async function submitStoryOrder(input: { sessionId: string; storyId: string; orderedEventIds: string[] }) {
  const session = await prisma.gameSession.findUnique({ where: { id: input.sessionId }, include: { player: true } });
  if (!session || session.gameMode !== "story_order") throw AppError.notFound("Story session not found");
  if (session.status !== "ACTIVE") throw AppError.badRequest("This story session has already ended");

  const events = await prisma.storyEvent.findMany({ where: { storyId: input.storyId }, orderBy: { correctOrder: "asc" } });
  if (events.length === 0) throw AppError.notFound("Story not found");

  const correctOrderIds = events.map((event) => event.id);
  const isCorrect =
    input.orderedEventIds.length === correctOrderIds.length &&
    input.orderedEventIds.every((id, index) => id === correctOrderIds[index]);

  const pointsEarned = isCorrect ? POINTS : 0;
  const starsAwarded = isCorrect ? 1 : 0;

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
      input.storyId,
      completedSession.score,
      await levelItems(),
    );
    nextLevelSlug = unlockResult.nextSlug;
  }

  const rewards = await awardProgressRewards(updatedPlayer.id);
  await logProgress({
    playerId: updatedPlayer.id,
    actionType: isCorrect ? "STORY_ORDER_CORRECT" : "STORY_ORDER_INCORRECT",
    xpDelta: pointsEarned,
    starsDelta: starsAwarded,
    streakDelta: isCorrect ? 1 : 0,
    metadata: { sessionId: completedSession.id, storyId: input.storyId },
  });

  return {
    session: completedSession,
    player: updatedPlayer,
    rewards,
    result: { isCorrect, pointsEarned, correctOrderIds, isComplete: true, nextLevelSlug },
  };
}
