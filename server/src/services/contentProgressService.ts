import { prisma } from "../lib/prisma";

// Shared level-progress tracker for the "collection" games -- each level is
// one fixed piece of content (a word search puzzle, a verse, a character, a
// story). One generic implementation instead of a near-duplicate of
// levelService.ts's PlayerLevelProgress logic per content type. Same unlock
// semantics: level 1 (lowest sortOrder) is unlocked by default, each
// subsequent level unlocks only once the prior one is completed.

export type ContentItem = { id: string; slug: string; title: string; sortOrder: number };

function sortBySortOrder(items: ContentItem[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listLevels(playerId: string, gameMode: string, items: ContentItem[]) {
  const sorted = sortBySortOrder(items);
  const progressRows = await prisma.playerContentProgress.findMany({ where: { playerId, gameMode } });
  const progressByContent = new Map(progressRows.map((row) => [row.contentId, row]));

  return sorted.map((item, index) => {
    const progress = progressByContent.get(item.id);

    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      levelNumber: index + 1,
      isUnlocked: index === 0 || Boolean(progress?.isUnlocked),
      isCompleted: Boolean(progress?.isCompleted),
      bestScore: progress?.bestScore ?? 0,
      attempts: progress?.attempts ?? 0,
    };
  });
}

export async function isContentUnlocked(playerId: string, gameMode: string, contentId: string, items: ContentItem[]) {
  const sorted = sortBySortOrder(items);

  if (sorted[0]?.id === contentId) {
    return true;
  }

  const progress = await prisma.playerContentProgress.findUnique({
    where: { playerId_gameMode_contentId: { playerId, gameMode, contentId } },
  });

  return Boolean(progress?.isUnlocked);
}

export async function recordAttempt(playerId: string, gameMode: string, contentId: string) {
  await prisma.playerContentProgress.upsert({
    where: { playerId_gameMode_contentId: { playerId, gameMode, contentId } },
    create: { playerId, gameMode, contentId, isUnlocked: true, attempts: 1 },
    update: { attempts: { increment: 1 } },
  });
}

// Marks the given content complete (tracking best score) and unlocks the
// next item in sortOrder, if there is one. Returns that next item's slug so
// callers can tell the frontend where to go next, matching how
// levelService.submitLevelAnswer reports nextLevelSlug.
export async function markCompleteAndUnlockNext(
  playerId: string,
  gameMode: string,
  contentId: string,
  score: number,
  items: ContentItem[],
) {
  const sorted = sortBySortOrder(items);
  const currentIndex = sorted.findIndex((item) => item.id === contentId);

  const existingProgress = await prisma.playerContentProgress.findUnique({
    where: { playerId_gameMode_contentId: { playerId, gameMode, contentId } },
  });
  const bestScore = Math.max(score, existingProgress?.bestScore ?? 0);

  await prisma.playerContentProgress.upsert({
    where: { playerId_gameMode_contentId: { playerId, gameMode, contentId } },
    create: { playerId, gameMode, contentId, isUnlocked: true, isCompleted: true, bestScore, completedAt: new Date() },
    update: { isCompleted: true, bestScore, completedAt: new Date() },
  });

  let nextSlug: string | null = null;

  if (currentIndex >= 0 && currentIndex + 1 < sorted.length) {
    const next = sorted[currentIndex + 1];

    await prisma.playerContentProgress.upsert({
      where: { playerId_gameMode_contentId: { playerId, gameMode, contentId: next.id } },
      create: { playerId, gameMode, contentId: next.id, isUnlocked: true },
      update: { isUnlocked: true },
    });

    nextSlug = next.slug;
  }

  return { nextSlug };
}

// Total levels this player has completed across every "collection" game --
// feeds the milestone-badge check in rewardService.ts. levelService.ts's
// PlayerLevelProgress (Bible Quiz Levels) is counted separately by the
// caller and added to this, since it's a distinct table with the same shape.
export async function countCompletedContentLevels(playerId: string): Promise<number> {
  return prisma.playerContentProgress.count({ where: { playerId, isCompleted: true } });
}
