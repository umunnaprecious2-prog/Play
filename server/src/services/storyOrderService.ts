import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { applyPlayerReward, awardProgressRewards, logProgress } from "./rewardService";
import { isContentUnlocked, listLevels, markCompleteAndUnlockNext, recordAttempt } from "./contentProgressService";

const GAME_MODE = "story_order";
const POINTS = 10;
// Levels reuse the same 8 categories Bible Quiz Levels, Character Guess,
// and Scripture Puzzle use. Each level pulls up to this many stories from
// its category -- real, multi-story work to unlock the next level.
const MAX_STORIES_PER_LEVEL = 20;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

// Serves a single story shortest-first-solved-skip (a proxy for difficulty)
// -- used only for the legacy non-level "quick practice" path (no
// categorySlug given).
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

// Levels = categories that actually have at least one story.
async function levelCategories() {
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  const counts = await prisma.bibleStory.groupBy({
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

async function storiesForCategory(categoryId: string) {
  return prisma.bibleStory.findMany({
    where: { isActive: true, categoryId },
    orderBy: { sortOrder: "asc" },
    take: MAX_STORIES_PER_LEVEL,
    include: { events: { orderBy: { correctOrder: "asc" } } },
  });
}

export async function listStoryOrderLevels(playerId: string) {
  return listLevels(playerId, GAME_MODE, await levelItems());
}

export async function startStoryOrderSession(input: { playerId: string; categorySlug?: string }) {
  const player = await prisma.playerProfile.findUnique({ where: { id: input.playerId } });
  if (!player) throw AppError.notFound("Player profile not found");

  let stories;
  let levelInfo: { levelNumber: number; maxLevel: number } | null = null;
  let levelAnchorId: string | null = null;

  if (input.categorySlug) {
    const categories = await levelCategories();
    const categoryIndex = categories.findIndex((category) => category.slug === input.categorySlug);
    if (categoryIndex === -1) throw AppError.notFound("Level not found");

    const category = categories[categoryIndex];
    const items = await levelItems();
    const unlocked = await isContentUnlocked(player.id, GAME_MODE, category.id, items);
    if (!unlocked) throw AppError.forbidden("Complete the previous level to unlock this one");

    await recordAttempt(player.id, GAME_MODE, category.id);
    levelInfo = { levelNumber: categoryIndex + 1, maxLevel: categories.length };
    levelAnchorId = category.id;
    stories = (await storiesForCategory(category.id)).filter((story) => story.events.length > 0);
  } else {
    const story = await pickNextStory(input.playerId);
    stories = story && story.events.length > 0 ? [story] : [];
  }

  if (stories.length === 0) {
    throw AppError.notFound("No stories available yet");
  }

  const session = await prisma.gameSession.create({
    data: {
      playerId: player.id,
      gameMode: "story_order",
      totalQuestions: stories.length,
      metadata: levelAnchorId ? { levelCategoryId: levelAnchorId } : {},
    },
  });

  return {
    session,
    levelNumber: levelInfo?.levelNumber ?? null,
    maxLevel: levelInfo?.maxLevel ?? null,
    stories: shuffle(stories).map((story) => ({
      id: story.id,
      slug: story.slug,
      title: story.title,
      shuffledEvents: shuffle(story.events.map((event) => ({ id: event.id, text: event.text }))),
    })),
  };
}

export async function submitStoryOrder(input: { sessionId: string; storyId: string; orderedEventIds: string[] }) {
  const session = await prisma.gameSession.findUnique({ where: { id: input.sessionId }, include: { player: true } });
  if (!session || session.gameMode !== "story_order") throw AppError.notFound("Story session not found");
  if (session.status !== "ACTIVE") throw AppError.badRequest("This story session has already ended");

  const events = await prisma.storyEvent.findMany({ where: { storyId: input.storyId }, orderBy: { correctOrder: "asc" } });
  if (events.length === 0) throw AppError.notFound("Story not found");

  const existingAnswer = await prisma.gameSessionAnswer.findFirst({
    where: { sessionId: session.id, questionId: input.storyId },
  });
  if (existingAnswer) throw AppError.badRequest("This story has already been answered");

  const correctOrderIds = events.map((event) => event.id);
  const isCorrect =
    input.orderedEventIds.length === correctOrderIds.length &&
    input.orderedEventIds.every((id, index) => id === correctOrderIds[index]);

  const pointsEarned = isCorrect ? POINTS : 0;
  const starsAwarded = isCorrect ? 1 : 0;

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
      questionId: input.storyId,
      selectedText: input.orderedEventIds.join(","),
      isCorrect,
      xpAwarded: pointsEarned,
      metadata: { correctOrderIds },
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
    result: { isCorrect, pointsEarned, correctOrderIds, isComplete, nextLevelSlug },
  };
}
