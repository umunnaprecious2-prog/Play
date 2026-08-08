"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import { triviaDifficultyForRound } from "../lib/player";
import { LevelCompleteScreen } from "./LevelCompleteScreen";
import type { GameAnswerResult, QuizQuestion } from "../lib/types";

const QUESTION_COUNT = 15;
const SECONDS_PER_QUESTION = 15;

type TriviaSession = {
  sessionId: string;
  questions: QuizQuestion[];
};

type AnsweredEntry = GameAnswerResult & { selectedText: string; timedOut: boolean };

export function TriviaGame() {
  const router = useRouter();
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [session, setSession] = useState<TriviaSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [round, setRound] = useState<number | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnsweredEntry>>({});
  const [submittingText, setSubmittingText] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION);
  const [totalScore, setTotalScore] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playerId) return;

    let cancelled = false;
    setIsLoadingSession(true);
    setSessionError(null);

    // Round is server-authoritative (derived from completed trivia sessions),
    // not tracked in localStorage -- the old client-side counter incremented
    // on every page load, not every completion.
    apiFetch<{ success: boolean; data: { currentLevel: number; maxLevel: number } }>(
      `/games/trivia/level-map?playerId=${encodeURIComponent(playerId)}`,
    )
      .then((levelResponse) => {
        if (cancelled) return;
        const currentRound = levelResponse.data.currentLevel;
        setRound(currentRound);

        return apiFetch<{ success: boolean; data: { session: { id: string }; questions: QuizQuestion[] } }>(
          "/games/quiz/sessions",
          {
            method: "POST",
            body: JSON.stringify({
              playerId,
              questionCount: QUESTION_COUNT,
              difficultySlug: triviaDifficultyForRound(currentRound),
              mode: "trivia",
            }),
          },
        );
      })
      .then((response) => {
        if (!cancelled && response) {
          setSession({ sessionId: response.data.session.id, questions: response.data.questions });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSessionError(error instanceof Error ? error.message : "Could not start trivia");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  const question = session?.questions[currentIndex];
  const currentAnswer = question ? answers[question.id] : undefined;

  async function submitAnswer(selectedText: string, timedOut: boolean) {
    if (!session || !question || currentAnswer) return;

    setSubmittingText(selectedText);

    try {
      const response = await apiFetch<{
        success: boolean;
        data: { result: GameAnswerResult; session: { score: number }; player: { xp: number } };
      }>("/games/quiz/answers", {
        method: "POST",
        body: JSON.stringify({ sessionId: session.sessionId, questionId: question.id, selectedText: selectedText || "__timeout__" }),
      });

      setTotalScore(response.data.session.score);
      setTotalXp(response.data.player.xp);
      setAnswers((previous) => ({
        ...previous,
        [question.id]: { ...response.data.result, selectedText, timedOut },
      }));
    } catch {
      // Trivia is fast-paced; on a network hiccup just move on rather than blocking play.
      setAnswers((previous) => ({
        ...previous,
        [question.id]: { isCorrect: false, xpAwarded: 0, starsAwarded: 0, correctText: null, isComplete: false, selectedText, timedOut },
      }));
    } finally {
      setSubmittingText(null);
    }
  }

  // Countdown timer per question.
  useEffect(() => {
    if (!question || currentAnswer) return;

    setSecondsLeft(SECONDS_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          void submitAnswer("", true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  const isSessionComplete = Boolean(currentAnswer?.isComplete);

  // Auto-advance shortly after an answer lands, unless that was the last question.
  useEffect(() => {
    if (!currentAnswer || !session || isSessionComplete) return;
    const timeout = setTimeout(() => {
      setCurrentIndex((value) => Math.min(session.questions.length - 1, value + 1));
    }, 1400);
    return () => clearTimeout(timeout);
  }, [currentAnswer, session, isSessionComplete]);

  if (isPlayerLoading || isLoadingSession) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading trivia...</h2>
      </section>
    );
  }

  if (playerError || sessionError || !session || !question) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">Trivia isn&apos;t ready yet</h2>
        <p className="text-sm text-slate-600">{playerError || sessionError}</p>
      </section>
    );
  }

  if (isSessionComplete) {
    const maxPossible = session.questions.length * 10;
    const ratio = maxPossible > 0 ? totalScore / maxPossible : 0;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : ratio > 0 ? 1 : 0;

    return (
      <LevelCompleteScreen
        label={`ROUND ${round ?? 1}/20 COMPLETE`}
        passed
        stars={stars}
        levelScore={totalScore}
        xpEarned={totalScore}
        totalScore={totalXp}
        continueLabel={round && round < 20 ? "Next Level" : "Back to Levels"}
        onContinue={() => router.push(round && round < 20 ? "/trivia/play" : "/trivia")}
        onBackToLevels={() => router.push("/trivia")}
      />
    );
  }

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-royal-50 px-4 py-2 text-sm font-semibold text-royal-700">🎯 Score: {totalScore}</span>
        {round ? (
          <span className="rounded-full bg-gold-50 px-4 py-2 text-sm font-semibold text-gold-700">Round {round}/20</span>
        ) : null}
        <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
          Question {currentIndex + 1} of {session.questions.length}
        </span>
        <span className={`rounded-full px-4 py-2 text-sm font-black ${secondsLeft <= 5 ? "bg-red-100 text-red-700" : "bg-gold-100 text-gold-700"}`}>
          ⏱ {secondsLeft}s
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${secondsLeft <= 5 ? "bg-red-400" : "bg-royal-400"}`}
          style={{ width: `${(secondsLeft / SECONDS_PER_QUESTION) * 100}%` }}
        />
      </div>

      <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-royal-200">Bible Trivia</p>
        <h3 className="mt-3 text-3xl font-black leading-tight">{question.prompt}</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const isCorrectOption = currentAnswer ? option.text === currentAnswer.correctText : false;
          const isWrongSelection = currentAnswer ? option.text === currentAnswer.selectedText && !currentAnswer.isCorrect : false;

          const stateClasses = currentAnswer
            ? isCorrectOption
              ? "border-green-400 bg-green-50 text-green-900"
              : isWrongSelection
                ? "border-red-400 bg-red-50 text-red-900"
                : "border-slate-100 bg-white text-slate-400"
            : "border-slate-200 bg-white text-slate-800 hover:border-royal-300 hover:bg-royal-50";

          return (
            <button
              key={option.id}
              type="button"
              disabled={Boolean(currentAnswer) || submittingText !== null}
              onClick={() => submitAnswer(option.text, false)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left text-base font-semibold transition disabled:cursor-not-allowed ${stateClasses}`}
            >
              <span>{option.text}</span>
              {currentAnswer && isCorrectOption ? <span aria-hidden>✅</span> : null}
              {currentAnswer && isWrongSelection ? <span aria-hidden>❌</span> : null}
            </button>
          );
        })}
      </div>

      {currentAnswer ? (
        <div className={`rounded-2xl px-4 py-4 text-base font-semibold ${currentAnswer.isCorrect ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
          {currentAnswer.timedOut
            ? `Time's up! The answer was "${currentAnswer.correctText}".`
            : currentAnswer.isCorrect
              ? `Correct! +${currentAnswer.xpAwarded} points.`
              : `Not quite. The answer was "${currentAnswer.correctText}".`}
        </div>
      ) : null}
    </section>
  );
}
