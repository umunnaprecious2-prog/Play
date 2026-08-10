import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { applyPlayerReward, awardProgressRewards, logProgress } from "./rewardService";

const DAILY_POINTS = 15;

function todayDateOnly(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

async function pickTodaysQuestion() {
  const count = await prisma.quizQuestion.count({ where: { isActive: true } });
  if (count === 0) throw AppError.notFound("No questions available for today's challenge yet");

  const dateKey = todayDateOnly().toISOString().slice(0, 10);
  const index = hashString(dateKey) % count;

  const question = await prisma.quizQuestion.findFirst({
    where: { isActive: true },
    orderBy: { id: "asc" },
    skip: index,
    include: { options: true, category: true },
  });

  if (!question) throw AppError.notFound("No questions available for today's challenge yet");
  return question;
}

export async function getTodayChallenge(playerId: string) {
  const player = await prisma.playerProfile.findUnique({ where: { id: playerId } });
  if (!player) throw AppError.notFound("Player profile not found");

  const date = todayDateOnly();
  const existing = await prisma.dailyChallengeCompletion.findUnique({
    where: { playerId_challengeDate: { playerId, challengeDate: date } },
  });

  const question = await pickTodaysQuestion();

  if (existing) {
    return {
      alreadyCompleted: true,
      isCorrect: existing.isCorrect,
      xpAwarded: existing.xpAwarded,
      question: { id: question.id, prompt: question.prompt, category: question.category?.name ?? null },
    };
  }

  return {
    alreadyCompleted: false,
    // No scriptureReference here -- it names the source passage and can
    // give the answer away before the player has picked one (e.g. a
    // "which prophet" question whose reference is that prophet's own
    // book). Returned from submitDailyChallengeAnswer's result instead,
    // once the question is actually answered.
    question: {
      id: question.id,
      prompt: question.prompt,
      category: question.category?.name ?? null,
      options: question.options.map((option) => ({ id: option.id, text: option.text })),
    },
  };
}

export async function submitDailyChallengeAnswer(input: { playerId: string; questionId: string; selectedText: string }) {
  const date = todayDateOnly();

  const existing = await prisma.dailyChallengeCompletion.findUnique({
    where: { playerId_challengeDate: { playerId: input.playerId, challengeDate: date } },
  });
  if (existing) {
    throw AppError.badRequest("Today's challenge has already been completed");
  }

  const todaysQuestion = await pickTodaysQuestion();
  if (todaysQuestion.id !== input.questionId) {
    throw AppError.badRequest("That isn't today's challenge question");
  }

  const correctOption = todaysQuestion.options.find((option) => option.isCorrect);
  const isCorrect = Boolean(correctOption && correctOption.text === input.selectedText);
  const xpAwarded = isCorrect ? DAILY_POINTS : 0;
  const starsAwarded = isCorrect ? 1 : 0;

  // These two writes are independent of each other, same as the parallel
  // fixes applied to the other games' answer-submission paths.
  const [updatedPlayer] = await Promise.all([
    applyPlayerReward(input.playerId, {
      xpDelta: xpAwarded,
      starsDelta: starsAwarded,
      isCorrect,
      countsAsGamePlayed: true,
    }),
    prisma.dailyChallengeCompletion.create({
      data: {
        playerId: input.playerId,
        challengeDate: date,
        questionId: todaysQuestion.id,
        isCorrect,
        xpAwarded,
      },
    }),
  ]);

  const [rewards] = await Promise.all([
    awardProgressRewards(updatedPlayer.id, updatedPlayer),
    logProgress({
      playerId: updatedPlayer.id,
      actionType: isCorrect ? "DAILY_CHALLENGE_CORRECT" : "DAILY_CHALLENGE_INCORRECT",
      xpDelta: xpAwarded,
      starsDelta: starsAwarded,
      streakDelta: isCorrect ? 1 : 0,
      metadata: { questionId: todaysQuestion.id },
    }),
  ]);

  return {
    player: updatedPlayer,
    rewards,
    result: {
      isCorrect,
      xpAwarded,
      correctText: correctOption?.text ?? null,
      scriptureReference: todaysQuestion.scriptureReference,
    },
  };
}
