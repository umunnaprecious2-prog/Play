import type { Category, QuizOption, QuizQuestion } from "@prisma/client";
import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { calculateLevel, updateStreak } from "../utils/gameMath";
import { categoryNameRevealsAnswer } from "../utils/categoryLabelReveal";
import { awardProgressRewards } from "./rewardService";
import { abandonSession, answeredItemIds, findActiveLevelSession } from "./sessionResumeService";

const POINTS_PER_QUESTION = 10;
const POINTS_PER_HINT = 2;
const MAX_HINTS_PER_QUESTION = 2;
const QUESTIONS_PER_LEVEL = 25;
const LEVEL_GAME_MODE = "quiz_level";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

type FullQuestion = QuizQuestion & { options: QuizOption[]; category: Category | null };

// The only shape a question is ever returned in before it's answered:
// prompt, image, and shuffled options with no isCorrect flag -- deliberately
// no explanation/scriptureReference (both would reveal the answer directly)
// and, unlike the old bulk endpoint, only ever ONE question at a time, never
// the rest of the level's set. hideLevelLabel tells the frontend when even
// showing the level's own name would give this specific question away (see
// categoryLabelReveal.ts) -- computed fresh each time, not hardcoded.
function formatQuestionForPlay(question: FullQuestion) {
  const correctOption = question.options.find((option) => option.isCorrect);
  const hideLevelLabel =
    Boolean(correctOption && question.category) &&
    categoryNameRevealsAnswer({
      categorySlug: question.category!.slug,
      categoryName: question.category!.name,
      correctText: correctOption!.text,
      distractorTexts: question.options.filter((option) => !option.isCorrect).map((option) => option.text),
    });

  return {
    id: question.id,
    slug: question.slug,
    prompt: question.prompt,
    imageUrl: question.imageUrl,
    imageAlt: question.imageAlt,
    hideLevelLabel,
    options: shuffle(question.options).map((option) => ({ id: option.id, text: option.text })),
  };
}

type SessionMetadata = { categorySlug?: string; categoryId?: string; questionOrder?: string[] };

function readMetadata(raw: unknown): SessionMetadata {
  return (raw && typeof raw === "object" ? (raw as SessionMetadata) : {}) ?? {};
}

// Picks the next not-yet-answered question id, in this session's fixed
// shuffled order. Falls back to the level's plain sortOrder if a session was
// created before questionOrder started being stored (so an old in-flight
// session still resumes sanely instead of erroring).
function pickNextQuestionId(allQuestions: FullQuestion[], storedOrder: string[] | undefined, answeredIds: Set<string>): string | null {
  const order = storedOrder && storedOrder.length > 0 ? storedOrder : allQuestions.map((q) => q.id);
  return order.find((id) => !answeredIds.has(id)) ?? null;
}

export async function listLevelsForPlayer(playerId: string) {
  const player = await prisma.playerProfile.findUnique({ where: { id: playerId } });

  if (!player) {
    throw AppError.notFound("Player profile not found");
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { quizQuestions: { where: { isActive: true } } } },
    },
  });

  const progressRows = await prisma.playerLevelProgress.findMany({ where: { playerId } });
  const progressByCategory = new Map(progressRows.map((row) => [row.categoryId, row]));

  return categories.map((category, index) => {
    const progress = progressByCategory.get(category.id);

    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      levelNumber: index + 1,
      totalQuestions: category._count.quizQuestions,
      isReady: category._count.quizQuestions >= QUESTIONS_PER_LEVEL,
      isUnlocked: index === 0 || Boolean(progress?.isUnlocked),
      isCompleted: Boolean(progress?.isCompleted),
      bestScore: progress?.bestScore ?? 0,
      attempts: progress?.attempts ?? 0,
    };
  });
}

async function isLevelUnlocked(playerId: string, category: { id: string; sortOrder: number }) {
  const firstCategory = await prisma.category.findFirst({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (firstCategory?.id === category.id) {
    return true;
  }

  const progress = await prisma.playerLevelProgress.findUnique({
    where: { playerId_categoryId: { playerId, categoryId: category.id } },
  });

  return Boolean(progress?.isUnlocked);
}

export async function startLevelSession(input: { playerId: string; categorySlug: string; restart?: boolean }) {
  const player = await prisma.playerProfile.findUnique({ where: { id: input.playerId } });

  if (!player) {
    throw AppError.notFound("Player profile not found");
  }

  const category = await prisma.category.findUnique({ where: { slug: input.categorySlug } });

  if (!category || !category.isActive) {
    throw AppError.notFound("Level not found");
  }

  const unlocked = await isLevelUnlocked(input.playerId, category);

  if (!unlocked) {
    throw AppError.forbidden("Complete the previous level to unlock this one");
  }

  const questions: FullQuestion[] = await prisma.quizQuestion.findMany({
    where: { isActive: true, categoryId: category.id },
    include: { options: { orderBy: { sortOrder: "asc" } }, category: true },
    take: QUESTIONS_PER_LEVEL,
    orderBy: { sortOrder: "asc" },
  });

  if (questions.length === 0) {
    throw AppError.notFound("This level has no questions yet");
  }

  const questionsById = new Map(questions.map((question) => [question.id, question]));

  // Resume an in-progress attempt at this exact level instead of always
  // starting over from question one -- unless the player explicitly asked
  // to restart, in which case the old attempt is marked abandoned.
  const existing = await findActiveLevelSession(input.playerId, LEVEL_GAME_MODE, "categorySlug", category.slug);

  if (existing) {
    if (input.restart) {
      await abandonSession(existing.id);
    } else {
      const answeredIds = await answeredItemIds(existing.id);
      const storedOrder = readMetadata(existing.metadata).questionOrder;
      const nextId = pickNextQuestionId(questions, storedOrder, answeredIds);
      const nextQuestion = nextId ? questionsById.get(nextId) : undefined;

      if (nextQuestion) {
        return {
          session: existing,
          level: { slug: category.slug, name: category.name },
          resumed: true,
          totalQuestions: questions.length,
          answeredOffset: answeredIds.size,
          question: formatQuestionForPlay(nextQuestion),
        };
      }
      // Every question was already answered but the session never closed
      // (an edge case, not the normal path) -- fall through and start fresh.
      await abandonSession(existing.id);
    }
  }

  // The shuffled order is fixed once, at session creation, and stored on the
  // session so every later "give me the next question" call (on answer
  // submission, or on a resume after a page refresh) walks the same
  // sequence -- rather than exposing the whole 25-question set up front the
  // way the old bulk endpoint did.
  const questionOrder = shuffle(questions).map((question) => question.id);

  const session = await prisma.gameSession.create({
    data: {
      playerId: player.id,
      gameMode: LEVEL_GAME_MODE,
      totalQuestions: questions.length,
      metadata: { categorySlug: category.slug, categoryId: category.id, questionOrder },
    },
  });

  await prisma.playerLevelProgress.upsert({
    where: { playerId_categoryId: { playerId: player.id, categoryId: category.id } },
    create: { playerId: player.id, categoryId: category.id, isUnlocked: true, attempts: 1 },
    update: { attempts: { increment: 1 } },
  });

  const firstQuestion = questionsById.get(questionOrder[0])!;

  return {
    session,
    level: { slug: category.slug, name: category.name },
    resumed: false,
    totalQuestions: questions.length,
    answeredOffset: 0,
    question: formatQuestionForPlay(firstQuestion),
  };
}

export async function requestLevelHint(input: { sessionId: string; questionId: string }) {
  const session = await prisma.gameSession.findUnique({ where: { id: input.sessionId } });

  if (!session || session.gameMode !== LEVEL_GAME_MODE) {
    throw AppError.notFound("Level session not found");
  }

  if (session.status !== "ACTIVE") {
    throw AppError.badRequest("This level session has already ended");
  }

  const existingAnswer = await prisma.gameSessionAnswer.findFirst({
    where: { sessionId: session.id, questionId: input.questionId },
  });

  if (existingAnswer) {
    throw AppError.badRequest("This question has already been answered");
  }

  const hintsUsed = await prisma.gameSessionHint.findMany({
    where: { sessionId: session.id, questionId: input.questionId },
  });

  if (hintsUsed.length >= MAX_HINTS_PER_QUESTION) {
    throw AppError.badRequest("No hints left for this question");
  }

  const question = await prisma.quizQuestion.findUnique({
    where: { id: input.questionId },
    include: { options: true },
  });

  if (!question) {
    throw AppError.notFound("Question not found");
  }

  const alreadyEliminated = new Set(hintsUsed.map((hint) => hint.eliminatedOptionId).filter(Boolean));
  const eliminationCandidates = question.options.filter(
    (option) => !option.isCorrect && !alreadyEliminated.has(option.id),
  );

  if (eliminationCandidates.length === 0) {
    throw AppError.badRequest("No hints left for this question");
  }

  const chosen = eliminationCandidates[Math.floor(Math.random() * eliminationCandidates.length)];
  const hintNumber = hintsUsed.length + 1;

  await prisma.gameSessionHint.create({
    data: {
      sessionId: session.id,
      questionId: input.questionId,
      hintNumber,
      eliminatedOptionId: chosen.id,
    },
  });

  return {
    hintNumber,
    eliminatedOptionId: chosen.id,
    eliminatedOptionText: chosen.text,
    hintsRemaining: MAX_HINTS_PER_QUESTION - hintNumber,
    maxPointsIfCorrect: Math.max(POINTS_PER_QUESTION - hintNumber * POINTS_PER_HINT, 0),
  };
}

export async function submitLevelAnswer(input: { sessionId: string; questionId: string; selectedText: string }) {
  // None of these three reads depend on each other's data -- each only
  // needs input.sessionId/input.questionId, which are already known -- so
  // fetching them one at a time was three sequential round trips for no
  // reason. Same fix as gameService's answer-submission paths.
  const [session, question, hintsUsed] = await Promise.all([
    prisma.gameSession.findUnique({ where: { id: input.sessionId }, include: { player: true } }),
    prisma.quizQuestion.findUnique({ where: { id: input.questionId }, include: { options: true, category: true } }),
    prisma.gameSessionHint.count({ where: { sessionId: input.sessionId, questionId: input.questionId } }),
  ]);

  if (!session || session.gameMode !== LEVEL_GAME_MODE) {
    throw AppError.notFound("Level session not found");
  }

  if (session.status !== "ACTIVE") {
    throw AppError.badRequest("This level session has already ended");
  }

  if (!question) {
    throw AppError.notFound("Quiz question not found");
  }

  const correctOption = question.options.find((option) => option.isCorrect);
  const isCorrect = Boolean(correctOption && correctOption.text === input.selectedText);
  const pointsEarned = isCorrect ? Math.max(POINTS_PER_QUESTION - hintsUsed * POINTS_PER_HINT, 0) : 0;
  const starsAwarded = isCorrect && hintsUsed === 0 ? 1 : 0;

  const nextXp = session.player.xp + pointsEarned;
  const nextCorrect = session.correctCount + (isCorrect ? 1 : 0);
  const nextIncorrect = session.incorrectCount + (isCorrect ? 0 : 1);
  const nextStreak = updateStreak(session.player.lastActiveAt, session.player.streakDays);

  const totalAnswered = session.correctCount + session.incorrectCount + 1;
  const isLevelComplete = totalAnswered >= session.totalQuestions;

  // Same independent-writes-in-parallel fix as gameService.ts's answer paths.
  const [updatedPlayer, answer, completedSession] = await Promise.all([
    prisma.playerProfile.update({
      where: { id: session.playerId },
      data: {
        xp: nextXp,
        level: calculateLevel(nextXp),
        stars: session.player.stars + starsAwarded,
        streakDays: nextStreak,
        lastActiveAt: new Date(),
        totalGamesPlayed:
          session.player.totalGamesPlayed + (session.correctCount + session.incorrectCount + 1 >= session.totalQuestions ? 1 : 0),
        totalCorrect: session.player.totalCorrect + (isCorrect ? 1 : 0),
        totalIncorrect: session.player.totalIncorrect + (isCorrect ? 0 : 1),
      },
    }),
    prisma.gameSessionAnswer.create({
      data: {
        sessionId: session.id,
        questionId: question.id,
        selectedText: input.selectedText,
        isCorrect,
        xpAwarded: pointsEarned,
        metadata: { correctText: correctOption?.text ?? null, hintsUsed, pointsEarned },
      },
    }),
    prisma.gameSession.update({
      where: { id: session.id },
      data: {
        correctCount: nextCorrect,
        incorrectCount: nextIncorrect,
        xpEarned: session.xpEarned + pointsEarned,
        starsEarned: session.starsEarned + starsAwarded,
        currentQuestion: totalAnswered,
        score: session.score + pointsEarned,
        status: isLevelComplete ? "COMPLETED" : "ACTIVE",
        completedAt: isLevelComplete ? new Date() : null,
      },
    }),
  ]);

  let nextLevelSlug: string | null = null;

  if (isLevelComplete && question.categoryId) {
    const existingProgress = await prisma.playerLevelProgress.findUnique({
      where: { playerId_categoryId: { playerId: session.playerId, categoryId: question.categoryId } },
    });
    const bestScore = Math.max(completedSession.score, existingProgress?.bestScore ?? 0);

    await prisma.playerLevelProgress.upsert({
      where: { playerId_categoryId: { playerId: session.playerId, categoryId: question.categoryId } },
      create: {
        playerId: session.playerId,
        categoryId: question.categoryId,
        isUnlocked: true,
        isCompleted: true,
        bestScore,
        completedAt: new Date(),
      },
      update: {
        isCompleted: true,
        bestScore,
        completedAt: new Date(),
      },
    });

    if (question.category) {
      const nextCategory = await prisma.category.findFirst({
        where: { isActive: true, sortOrder: { gt: question.category.sortOrder } },
        orderBy: { sortOrder: "asc" },
      });

      if (nextCategory) {
        await prisma.playerLevelProgress.upsert({
          where: { playerId_categoryId: { playerId: session.playerId, categoryId: nextCategory.id } },
          create: { playerId: session.playerId, categoryId: nextCategory.id, isUnlocked: true },
          update: { isUnlocked: true },
        });
        nextLevelSlug = nextCategory.slug;
      }
    }
  }

  // The next question to hand the frontend, in this session's fixed shuffled
  // order -- fetched fresh rather than kept from an earlier bulk query, so
  // the API never has more than one unanswered question's data in flight at
  // once. Only looked up when the level isn't finished.
  let nextQuestion: ReturnType<typeof formatQuestionForPlay> | null = null;

  if (!isLevelComplete) {
    const answeredIds = await answeredItemIds(completedSession.id);
    let orderList = readMetadata(completedSession.metadata).questionOrder;

    if (!orderList || orderList.length === 0) {
      // Sessions created before questionOrder started being stored -- fall
      // back to the level's plain sortOrder so an old in-flight session
      // still resumes sanely instead of erroring.
      const fallback = await prisma.quizQuestion.findMany({
        where: { isActive: true, categoryId: question.categoryId ?? undefined },
        select: { id: true },
        orderBy: { sortOrder: "asc" },
        take: QUESTIONS_PER_LEVEL,
      });
      orderList = fallback.map((row) => row.id);
    }

    const nextId = orderList.find((id) => !answeredIds.has(id));
    const nextQuestionRow = nextId
      ? await prisma.quizQuestion.findUnique({ where: { id: nextId }, include: { options: true, category: true } })
      : null;

    if (nextQuestionRow) {
      nextQuestion = formatQuestionForPlay(nextQuestionRow);
    }
  }

  const [rewards] = await Promise.all([
    awardProgressRewards(updatedPlayer.id, updatedPlayer),
    prisma.playerProgressLog.create({
      data: {
        playerId: updatedPlayer.id,
        actionType: isCorrect ? "LEVEL_QUIZ_CORRECT" : "LEVEL_QUIZ_INCORRECT",
        xpDelta: pointsEarned,
        starsDelta: starsAwarded,
        streakDelta: isCorrect ? 1 : 0,
        metadata: { sessionId: completedSession.id, questionId: question.id, answerId: answer.id, hintsUsed },
      },
    }),
  ]);

  return {
    session: completedSession,
    player: updatedPlayer,
    answer,
    rewards,
    nextQuestion,
    result: {
      isCorrect,
      pointsEarned,
      hintsUsed,
      starsAwarded,
      correctText: correctOption?.text ?? null,
      explanation: question.explanation,
      scriptureReference: question.scriptureReference,
      isComplete: isLevelComplete,
      nextLevelSlug,
    },
  };
}
