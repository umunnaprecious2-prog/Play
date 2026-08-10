"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import { LevelCompleteScreen } from "./LevelCompleteScreen";
import type { LevelAnswerResult, LevelHintResult, LevelQuestion } from "../lib/types";

const OPTION_LETTERS = ["A", "B", "C", "D"];
const MAX_HINTS = 2;
const NEUTRAL_LEVEL_LABEL = "BIBLE QUIZ";

type LevelSession = {
  sessionId: string;
  levelName: string;
  totalQuestions: number;
  answeredCount: number;
  currentQuestion: LevelQuestion;
};

type LevelQuizProps = {
  categorySlug: string;
};

export function LevelQuiz({ categorySlug }: LevelQuizProps) {
  const router = useRouter();
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [session, setSession] = useState<LevelSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [eliminatedOptionIds, setEliminatedOptionIds] = useState<string[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<(LevelAnswerResult & { selectedText: string }) | null>(null);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<LevelQuestion | null>(null);

  const [isHinting, setIsHinting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  function resetQuestionState() {
    setEliminatedOptionIds([]);
    setHintsUsed(0);
    setCurrentAnswer(null);
    setPendingNextQuestion(null);
  }

  function loadSession(restart: boolean) {
    let cancelled = false;
    setIsLoadingSession(true);
    setSessionError(null);

    apiFetch<{
      success: boolean;
      data: {
        session: { id: string; score: number };
        level: { name: string };
        totalQuestions: number;
        answeredOffset: number;
        question: LevelQuestion;
      };
    }>(`/games/levels/${categorySlug}/sessions`, { method: "POST", body: JSON.stringify({ playerId, restart }) })
      .then((response) => {
        if (!cancelled) {
          setSession({
            sessionId: response.data.session.id,
            levelName: response.data.level.name,
            totalQuestions: response.data.totalQuestions,
            answeredCount: response.data.answeredOffset,
            currentQuestion: response.data.question,
          });
          setSessionScore(response.data.session.score);
          resetQuestionState();
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSessionError(error instanceof Error ? error.message : "Could not start this level");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingSession(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }

  useEffect(() => {
    if (!playerId) {
      return;
    }

    return loadSession(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, categorySlug]);

  function startOver() {
    if (!confirm("Start this level over from Question 1? Your progress so far on this level will be replaced.")) {
      return;
    }
    loadSession(true);
  }

  if (isPlayerLoading || isLoadingSession) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading level...</h2>
      </section>
    );
  }

  if (playerError || sessionError || !session) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">Can&apos;t start this level</h2>
        <p className="text-sm leading-6 text-slate-600">{playerError || sessionError}</p>
        <Link href="/levels" className="text-sm font-semibold text-sunrise-600 hover:underline">
          Back to the level map
        </Link>
      </section>
    );
  }

  const { sessionId, levelName, totalQuestions, answeredCount, currentQuestion: question } = session;
  const isLevelComplete = currentAnswer?.isComplete === true;

  async function handleHint() {
    if (currentAnswer || isHinting || hintsUsed >= MAX_HINTS) {
      return;
    }

    setIsHinting(true);
    setActionError(null);

    try {
      const response = await apiFetch<{ success: boolean; data: LevelHintResult }>("/games/levels/hints", {
        method: "POST",
        body: JSON.stringify({ sessionId, questionId: question.id }),
      });

      setHintsUsed(response.data.hintNumber);
      setEliminatedOptionIds((previous) => [...previous, response.data.eliminatedOptionId]);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not get a hint");
    } finally {
      setIsHinting(false);
    }
  }

  async function handleSelect(selectedText: string) {
    if (currentAnswer || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await apiFetch<{
        success: boolean;
        data: { result: LevelAnswerResult; session: { score: number }; player: { xp: number }; nextQuestion: LevelQuestion | null };
      }>("/games/levels/answers", {
        method: "POST",
        body: JSON.stringify({ sessionId, questionId: question.id, selectedText }),
      });

      setSessionScore(response.data.session.score);
      setTotalXp(response.data.player.xp);
      setCurrentAnswer({ ...response.data.result, selectedText });
      setPendingNextQuestion(response.data.nextQuestion);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not submit your answer");
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToNextQuestion() {
    if (!pendingNextQuestion) {
      return;
    }
    setSession((previous) =>
      previous ? { ...previous, answeredCount: previous.answeredCount + 1, currentQuestion: pendingNextQuestion } : previous,
    );
    resetQuestionState();
  }

  if (isLevelComplete) {
    const maxPossible = totalQuestions * 10;
    const ratio = maxPossible > 0 ? sessionScore / maxPossible : 0;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio > 0 ? 1 : 0;
    const nextLevelSlug = currentAnswer?.nextLevelSlug;

    return (
      <div className="grid gap-4">
        <LevelCompleteScreen
          label={`${levelName.toUpperCase()} COMPLETE`}
          passed
          stars={stars}
          levelScore={sessionScore}
          xpEarned={sessionScore}
          totalScore={totalXp}
          continueLabel={nextLevelSlug ? "Continue to Next Level" : "Back to Map"}
          onContinue={() => router.push(nextLevelSlug ? `/levels/${nextLevelSlug}` : "/levels")}
          onBackToLevels={() => router.push("/levels")}
        />
        <Link href="/levels" className="justify-self-center text-sm font-semibold text-royal-600 hover:underline">
          ← Back to the level map
        </Link>
      </div>
    );
  }

  const hintsRemaining = MAX_HINTS - hintsUsed;
  const maxPointsIfCorrect = Math.max(10 - hintsUsed * 2, 0);

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-sunrise-50 px-4 py-2 text-sm font-semibold text-sunrise-700">🏅 Score: {sessionScore}</span>
        <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
          Question {answeredCount + 1} of {totalQuestions}
        </span>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Up to {maxPointsIfCorrect} pts</span>
        {answeredCount > 0 ? (
          <button type="button" onClick={startOver} className="text-xs font-semibold text-slate-400 underline hover:text-slate-600">
            Start level over
          </button>
        ) : null}
      </div>

      <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-lg">
        {/* Some level names (e.g. "Song of Solomon") would give the answer
            away to a question about them just by being shown -- computed
            server-side per question via hideLevelLabel, not hardcoded here. */}
        <p className="text-sm uppercase tracking-[0.2em] text-sky-200">{question.hideLevelLabel ? NEUTRAL_LEVEL_LABEL : levelName}</p>
        <h3 className="mt-3 text-3xl font-black leading-tight">{question.prompt}</h3>
        {/* Scripture reference is withheld until after answering -- shown
            alongside the explanation below instead, since the reference alone
            gives away the answer for many questions (e.g. a "which prophet"
            question whose reference is that prophet's own book). */}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option, index) => {
          const isEliminated = eliminatedOptionIds.includes(option.id);
          const isSelected = currentAnswer ? option.text === currentAnswer.selectedText : false;
          const isCorrectOption = currentAnswer ? option.text === currentAnswer.correctText : false;
          const isWrongSelection = currentAnswer ? isSelected && !currentAnswer.isCorrect : false;

          const stateClasses = currentAnswer
            ? isCorrectOption
              ? "border-green-400 bg-green-50 text-green-900"
              : isWrongSelection
                ? "border-red-400 bg-red-50 text-red-900"
                : "border-slate-100 bg-white text-slate-400"
            : isEliminated
              ? "border-slate-100 bg-slate-50 text-slate-300 line-through"
              : "border-slate-200 bg-white text-slate-800 hover:border-sunrise-300 hover:bg-sunrise-50";

          return (
            <button
              key={option.id}
              type="button"
              disabled={Boolean(currentAnswer) || isEliminated || isSubmitting}
              onClick={() => handleSelect(option.text)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left text-base font-semibold transition disabled:cursor-not-allowed ${stateClasses}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900/10 text-sm font-black">
                {OPTION_LETTERS[index] ?? "?"}
              </span>
              <span className="flex-1">{option.text}</span>
              {currentAnswer && isCorrectOption ? <span aria-hidden>✅</span> : null}
              {currentAnswer && isWrongSelection ? <span aria-hidden>❌</span> : null}
            </button>
          );
        })}
      </div>

      {!currentAnswer ? (
        <button
          type="button"
          onClick={handleHint}
          disabled={isHinting || hintsRemaining <= 0}
          className="justify-self-start rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-amber-950 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          💡 {hintsRemaining > 0 ? `Hint (-2 pts) · ${hintsRemaining} left` : "No hints left"}
        </button>
      ) : null}

      {actionError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{actionError}</p> : null}

      {currentAnswer ? (
        <div className="grid gap-3">
          <div
            className={`rounded-2xl px-4 py-4 text-base font-semibold ${
              currentAnswer.isCorrect ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"
            }`}
          >
            {currentAnswer.isCorrect
              ? `Correct! +${currentAnswer.pointsEarned} points.`
              : `Not quite. The correct answer is "${currentAnswer.correctText}".`}
          </div>
          {currentAnswer.explanation ? (
            <div className="rounded-2xl bg-royal-50 px-4 py-4 text-sm leading-6 text-royal-900">
              <span className="font-bold">Why: </span>
              {currentAnswer.explanation}
              {currentAnswer.scriptureReference ? <span className="text-royal-600"> ({currentAnswer.scriptureReference})</span> : null}
            </div>
          ) : null}
          <button
            type="button"
            onClick={goToNextQuestion}
            className="justify-self-start rounded-full bg-sky-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-600"
          >
            Next Question →
          </button>
        </div>
      ) : null}
    </section>
  );
}
