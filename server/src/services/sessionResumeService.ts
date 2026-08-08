import { prisma } from "../lib/prisma";

// Shared "resume where you left off" helpers used by every level-based game.
// Previously, clicking back into a level you were mid-way through always
// started a brand new session from scratch, silently abandoning whatever
// progress you'd made -- even though you'd already banked points on it.
// Now each game checks for an existing in-progress session for that exact
// level first, and only starts fresh if there isn't one or the player
// explicitly asks to restart.

// Finds the most recent ACTIVE session for this player, game, and specific
// level, identified by a single metadata key/value pair (e.g.
// {categorySlug: "genesis"} for Bible Quiz Levels, {puzzleId: "..."} for
// Word Search, {levelCategoryId: "..."} for the category-batched games).
export async function findActiveLevelSession(playerId: string, gameMode: string, metadataKey: string, metadataValue: string) {
  return prisma.gameSession.findFirst({
    where: {
      playerId,
      gameMode,
      status: "ACTIVE",
      metadata: { path: [metadataKey], equals: metadataValue },
    },
    orderBy: { startedAt: "desc" },
  });
}

// Marks an in-progress session as abandoned rather than deleting it, so it
// still shows up in a player's history/stats honestly instead of vanishing.
export async function abandonSession(sessionId: string) {
  await prisma.gameSession.update({ where: { id: sessionId }, data: { status: "ABANDONED" } });
}

// IDs of questions/items already answered within a given session, so a
// resumed session can skip straight to what's left instead of re-asking
// things the player already got through.
export async function answeredItemIds(sessionId: string): Promise<Set<string>> {
  const answers = await prisma.gameSessionAnswer.findMany({ where: { sessionId }, select: { questionId: true } });
  return new Set(answers.map((answer) => answer.questionId).filter((id): id is string => Boolean(id)));
}
