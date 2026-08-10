"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import type { DailyChallengeAnswerResult, DailyChallengeQuestion } from "../lib/types";

type TodayResponse = {
  alreadyCompleted: boolean;
  isCorrect?: boolean;
  xpAwarded?: number;
  question: DailyChallengeQuestion & { options?: Array<{ id: string; text: string }> };
};

export function DailyChallenge() {
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<DailyChallengeAnswerResult | null>(null);

  useEffect(() => {
    if (!playerId) return;

    let cancelled = false;
    setIsLoading(true);

    apiFetch<{ success: boolean; data: TodayResponse }>(`/games/daily?playerId=${encodeURIComponent(playerId)}`)
      .then((response) => {
        if (!cancelled) setToday(response.data);
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) setError(fetchError instanceof Error ? fetchError.message : "Could not load today's challenge");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  async function submit(selectedText: string) {
    if (!playerId || !today || isSubmitting || result) return;
    setIsSubmitting(true);

    try {
      const response = await apiFetch<{ success: boolean; data: { result: DailyChallengeAnswerResult } }>("/games/daily/answers", {
        method: "POST",
        body: JSON.stringify({ playerId, questionId: today.question.id, selectedText }),
      });
      setResult(response.data.result);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit your answer");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isPlayerLoading || isLoading) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading today&apos;s challenge...</h2>
      </section>
    );
  }

  if (playerError || error || !today) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">Today&apos;s challenge isn&apos;t ready yet</h2>
        <p className="text-sm text-slate-600">{playerError || error}</p>
      </section>
    );
  }

  if (today.alreadyCompleted || result) {
    const isCorrect = result?.isCorrect ?? today.isCorrect;
    const xpAwarded = result?.xpAwarded ?? today.xpAwarded ?? 0;

    return (
      <section className="grid gap-4 rounded-[1.75rem] border border-white/80 bg-white/80 p-8 text-center shadow-soft backdrop-blur">
        <div className="text-5xl">📅</div>
        <h2 className="text-3xl font-black text-slate-900">Come Back Tomorrow!</h2>
        <p className="text-lg text-slate-700">
          {isCorrect ? `You got today's challenge right and earned ${xpAwarded} XP.` : "You've already answered today's challenge."}
        </p>
        {/* Scripture reference is only ever shown here, after answering --
            never on the question card itself, since it would give the
            answer away before the child picks an option. */}
        {result && !isCorrect && result.correctText ? (
          <p className="text-base font-semibold text-amber-700">The correct answer was &quot;{result.correctText}&quot;.</p>
        ) : null}
        {result?.scriptureReference ? <p className="text-sm text-slate-500">{result.scriptureReference}</p> : null}
      </section>
    );
  }

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">Today&apos;s Challenge</h2>
        {today.question.category ? (
          <span className="rounded-full bg-sunrise-50 px-4 py-2 text-sm font-semibold text-sunrise-700">{today.question.category}</span>
        ) : null}
      </div>

      <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-sunrise-200">One Question, Once a Day</p>
        <h3 className="mt-3 text-3xl font-black leading-tight">{today.question.prompt}</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(today.question.options ?? []).map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={isSubmitting}
            onClick={() => submit(option.text)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-base font-semibold text-slate-800 transition hover:border-sunrise-300 hover:bg-sunrise-50 disabled:cursor-not-allowed"
          >
            {option.text}
          </button>
        ))}
      </div>
    </section>
  );
}
