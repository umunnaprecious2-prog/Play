"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import type { GameAnswerResult, QuizQuestion } from "../lib/types";

type AnsweredEntry = GameAnswerResult & { selectedText: string };
type AnsweredState = Record<string, AnsweredEntry>;

type QuizSession = {
  sessionId: string;
  questions: QuizQuestion[];
};

export function QuizPreview() {
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnsweredState>({});
  const [submittingText, setSubmittingText] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) {
      return;
    }

    let cancelled = false;
    setIsLoadingSession(true);
    setSessionError(null);

    apiFetch<{ success: boolean; data: { session: { id: string }; questions: QuizQuestion[] } }>("/games/quiz/sessions", {
      method: "POST",
      body: JSON.stringify({ playerId, questionCount: 5 }),
    })
      .then((response) => {
        if (!cancelled) {
          setSession({ sessionId: response.data.session.id, questions: response.data.questions });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSessionError(error instanceof Error ? error.message : "Could not start a quiz session");
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
  }, [playerId]);

  if (isPlayerLoading || isLoadingSession) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading your quiz...</h2>
        <p className="text-sm text-slate-600">Getting a fresh set of questions ready.</p>
      </section>
    );
  }

  if (playerError || sessionError || !session) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">No quiz questions available yet</h2>
        <p className="text-sm leading-6 text-slate-600">{playerError || sessionError || "Seed the server database first."}</p>
      </section>
    );
  }

  const { sessionId, questions } = session;
  const question = questions[currentIndex];

  if (!question) {
    return null;
  }

  const currentAnswer = answers[question.id];

  async function handleSelect(selectedText: string) {
    if (currentAnswer || submittingText) {
      return;
    }

    setSubmittingText(selectedText);
    setAnswerError(null);

    try {
      const response = await apiFetch<{ success: boolean; data: { result: GameAnswerResult } }>("/games/quiz/answers", {
        method: "POST",
        body: JSON.stringify({ sessionId, questionId: question.id, selectedText }),
      });

      setAnswers((previous) => ({ ...previous, [question.id]: { ...response.data.result, selectedText } }));
    } catch (submitError) {
      setAnswerError(submitError instanceof Error ? submitError.message : "Could not submit answer");
    } finally {
      setSubmittingText(null);
    }
  }

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Quiz preview</h2>
          <p className="mt-1 text-sm text-slate-600">Large buttons, few words, and fast feedback.</p>
        </div>
        <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-sky-200">Bible Quiz</p>
        <h3 className="mt-3 text-3xl font-black leading-tight">{question.prompt}</h3>
        {question.scriptureReference ? <p className="mt-3 text-sm text-slate-300">{question.scriptureReference}</p> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const isSelected = currentAnswer ? option.text === currentAnswer.selectedText : false;
          const isCorrectOption = currentAnswer ? option.text === currentAnswer.correctText : false;
          const isWrongSelection = Boolean(currentAnswer) && isSelected && !currentAnswer.isCorrect;

          const stateClasses = currentAnswer
            ? isCorrectOption
              ? "border-green-400 bg-green-50 text-green-900"
              : isWrongSelection
                ? "border-red-400 bg-red-50 text-red-900"
                : "border-slate-100 bg-white text-slate-400"
            : "border-slate-200 bg-white text-slate-800 hover:border-sunrise-300 hover:bg-sunrise-50";

          return (
            <button
              key={option.id}
              type="button"
              disabled={Boolean(currentAnswer) || submittingText !== null}
              onClick={() => handleSelect(option.text)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left text-base font-semibold transition disabled:cursor-not-allowed ${stateClasses}`}
            >
              <span>{option.text}</span>
              {currentAnswer && isCorrectOption ? <span aria-hidden>✅</span> : null}
              {currentAnswer && isWrongSelection ? <span aria-hidden>❌</span> : null}
              {submittingText === option.text ? <span aria-hidden>…</span> : null}
            </button>
          );
        })}
      </div>

      {answerError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{answerError}</p> : null}

      {currentAnswer ? (
        <div
          className={`rounded-2xl px-4 py-4 text-base font-semibold ${
            currentAnswer.isCorrect ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"
          }`}
        >
          {currentAnswer.isCorrect
            ? `Great job! You earned ${currentAnswer.xpAwarded} XP.`
            : `Not quite — the correct answer is "${currentAnswer.correctText}".`}
        </div>
      ) : null}

      {currentAnswer && question.explanation ? (
        <div className="rounded-2xl bg-sky-50 px-4 py-4 text-sm leading-6 text-sky-900">
          <span className="font-bold">Why: </span>
          {question.explanation}
          {question.scriptureReference ? <span className="text-sky-700"> ({question.scriptureReference})</span> : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setCurrentIndex((value) => Math.min(questions.length - 1, value + 1))}
          className="rounded-full bg-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-600"
        >
          Next
        </button>
      </div>
    </section>
  );
}
