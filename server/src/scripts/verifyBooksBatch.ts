import { prisma } from "../lib/prisma";

const BASE = "http://localhost:5000/api";

async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${path} -> ${res.status}: ${JSON.stringify(json)}`);
  return json as any;
}

async function solveLevel(playerId: string, categorySlug: string) {
  const start = await api(`/games/levels/${categorySlug}/sessions`, { method: "POST", body: JSON.stringify({ playerId }) });
  const sessionId = start.data.session.id;
  const questions = start.data.questions;
  let nextLevelSlug: string | null = null;
  let correctCount = 0;

  for (const q of questions) {
    const dbQuestion = await prisma.quizQuestion.findUnique({ where: { id: q.id }, include: { options: true } });
    if (!dbQuestion) throw new Error(`question ${q.id} missing`);
    const correctOption = dbQuestion.options.find((o) => o.isCorrect);
    if (!correctOption) throw new Error(`no correct option for ${q.id}`);

    const res = await api("/games/levels/answers", {
      method: "POST",
      body: JSON.stringify({ sessionId, questionId: q.id, selectedText: correctOption.text }),
    });
    if (res.data.result.isCorrect) correctCount += 1;
    if (res.data.result.nextLevelSlug) nextLevelSlug = res.data.result.nextLevelSlug;
  }

  return { totalQuestions: questions.length, correctCount, nextLevelSlug };
}

async function main() {
  const bookOrder = process.argv.slice(2);
  if (bookOrder.length === 0) {
    console.error("Usage: tsx src/scripts/verifyBooksBatch.ts <first-category-slug> <second-category-slug> ...");
    process.exitCode = 1;
    return;
  }

  const nickname = `BooksBatchVerify${Date.now().toString(36)}`;
  const created = await api("/games/players", { method: "POST", body: JSON.stringify({ nickname }) });
  const playerId = created.data.id;

  const firstCategory = await prisma.category.findUniqueOrThrow({ where: { slug: bookOrder[0] } });
  await prisma.playerLevelProgress.upsert({
    where: { playerId_categoryId: { playerId, categoryId: firstCategory.id } },
    create: { playerId, categoryId: firstCategory.id, isUnlocked: true },
    update: { isUnlocked: true },
  });

  for (const slug of bookOrder) {
    const result = await solveLevel(playerId, slug);
    console.log(
      `${slug}: ${result.totalQuestions} questions, ${result.correctCount}/${result.totalQuestions} correct, unlocked next: ${result.nextLevelSlug}`,
    );
    if (result.correctCount !== result.totalQuestions) {
      throw new Error(`${slug}: not all answers scored as correct -- a real content/answer-key bug`);
    }
  }

  const levels = await api(`/games/levels?playerId=${playerId}`);
  const relevant = levels.data.filter((l: any) => bookOrder.includes(l.slug));
  console.log("\nFinal level states:");
  for (const l of relevant) {
    console.log(`  ${l.slug}: unlocked=${l.isUnlocked} completed=${l.isCompleted} totalQuestions=${l.totalQuestions}`);
  }

  await prisma.playerProfile.delete({ where: { id: playerId } });
  console.log("\nCleaned up test player", playerId);
}

main()
  .catch((err) => {
    console.error("FAILED:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
