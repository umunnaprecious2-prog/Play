import type { Prisma, PlayerProfile } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { calculateLevel, updateStreak } from "../utils/gameMath";
import { AppError } from "../exceptions/AppError";

// Shared XP/level/streak update used by every game mode. Keeping this in one
// place means new games don't have to re-implement the same player-mutation
// logic that already exists (slightly differently) in gameService.ts and
// levelService.ts.
export async function applyPlayerReward(
  playerId: string,
  input: { xpDelta: number; starsDelta: number; isCorrect: boolean; countsAsGamePlayed?: boolean },
) {
  const player = await prisma.playerProfile.findUnique({ where: { id: playerId } });

  if (!player) {
    throw AppError.notFound("Player profile not found");
  }

  const nextXp = Math.max(player.xp + input.xpDelta, 0);
  const nextStreak = updateStreak(player.lastActiveAt, player.streakDays);

  return prisma.playerProfile.update({
    where: { id: playerId },
    data: {
      xp: nextXp,
      level: calculateLevel(nextXp),
      stars: player.stars + input.starsDelta,
      streakDays: nextStreak,
      lastActiveAt: new Date(),
      totalGamesPlayed: player.totalGamesPlayed + (input.countsAsGamePlayed ? 1 : 0),
      totalCorrect: player.totalCorrect + (input.isCorrect ? 1 : 0),
      totalIncorrect: player.totalIncorrect + (input.isCorrect ? 0 : 1),
    },
  });
}

// Total levels completed across every level-based game -- Bible Quiz Levels
// (PlayerLevelProgress) plus the "collection" games sharing the generic
// PlayerContentProgress table. Feeds milestone badges (Badge.levelsCompletedThreshold).
// Group B games (Match the Verse, Flash Cards, Trivia) have no discrete
// per-level completion row, so they don't contribute to this count.
async function countTotalLevelsCompleted(playerId: string): Promise<number> {
  const [levelProgressCount, contentProgressCount] = await Promise.all([
    prisma.playerLevelProgress.count({ where: { playerId, isCompleted: true } }),
    prisma.playerContentProgress.count({ where: { playerId, isCompleted: true } }),
  ]);
  return levelProgressCount + contentProgressCount;
}

// Same badge/avatar unlock evaluation used across every game mode -- this is
// the one shared implementation; levelService.ts previously had its own
// separate copy that didn't check the milestone threshold below, since that
// threshold didn't exist yet.
//
// This runs after every single answer submission in every game, so its
// latency directly adds to "how long until the correct/incorrect feedback
// shows up" -- it was previously ~7 sequential DB round trips (refetching a
// player the caller had usually just fetched already, then four independent
// lookups one at a time, then two unlock writes one at a time). Fixed by
// accepting an already-loaded player (skips the redundant refetch) and
// running the independent reads/writes in parallel instead of in sequence --
// same queries, same result, far fewer round trips end to end. This matters
// most against a real network-hop database (production's Neon connection),
// where each sequential round trip adds real, felt latency.
export async function awardProgressRewards(playerId: string, preloadedPlayer?: PlayerProfile) {
  const player = preloadedPlayer ?? (await prisma.playerProfile.findUnique({ where: { id: playerId } }));

  if (!player) {
    throw AppError.notFound("Player profile not found");
  }

  const [totalLevelsCompleted, eligibleBadges, unlockedBadges, avatarItems, unlockedAvatars] = await Promise.all([
    countTotalLevelsCompleted(playerId),
    prisma.badge.findMany({
      where: { isActive: true, xpThreshold: { lte: player.xp }, streakDaysNeeded: { lte: player.streakDays } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.playerBadge.findMany({ where: { playerId } }),
    prisma.avatarItem.findMany({
      where: {
        isActive: true,
        unlockXp: { lte: player.xp },
        unlockLevel: { lte: player.level },
        unlockStreakDays: { lte: player.streakDays },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.playerAvatarUnlock.findMany({ where: { playerId } }),
  ]);

  const badges = eligibleBadges.filter(
    (badge) => badge.levelsCompletedThreshold == null || totalLevelsCompleted >= badge.levelsCompletedThreshold,
  );
  const unlockedBadgeIds = new Set(unlockedBadges.map((badge) => badge.badgeId));
  const badgesToUnlock = badges.filter((badge) => !unlockedBadgeIds.has(badge.id));

  const unlockedAvatarIds = new Set(unlockedAvatars.map((avatar) => avatar.avatarItemId));
  const avatarsToUnlock = avatarItems.filter((avatar) => !unlockedAvatarIds.has(avatar.id));

  await Promise.all([
    badgesToUnlock.length > 0
      ? prisma.playerBadge.createMany({
          data: badgesToUnlock.map((badge) => ({ playerId, badgeId: badge.id })),
          skipDuplicates: true,
        })
      : null,
    avatarsToUnlock.length > 0
      ? prisma.playerAvatarUnlock.createMany({
          data: avatarsToUnlock.map((avatar) => ({ playerId, avatarItemId: avatar.id })),
          skipDuplicates: true,
        })
      : null,
  ]);

  return { badgesUnlocked: badgesToUnlock, avatarsUnlocked: avatarsToUnlock };
}

export async function logProgress(input: {
  playerId: string;
  actionType: string;
  xpDelta: number;
  starsDelta: number;
  streakDelta: number;
  metadata?: Record<string, unknown>;
}) {
  return prisma.playerProgressLog.create({
    data: {
      playerId: input.playerId,
      actionType: input.actionType,
      xpDelta: input.xpDelta,
      starsDelta: input.starsDelta,
      streakDelta: input.streakDelta,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}
