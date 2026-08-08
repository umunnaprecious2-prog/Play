"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import { LevelCompleteScreen } from "./LevelCompleteScreen";
import type { CharacterGuessResult, CharacterHintResult, CharacterRound } from "../lib/types";

type RoundState = { clues: string[]; hintsUsed: number; answer?: CharacterGuessResult };

export function CharacterGuess({ levelSlug }: { levelSlug: string }) {
  const router = useRouter();
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [rounds, setRounds] = useState<CharacterRound[] | null>(null);
  const [levelNumber, setLevelNumber] = useState<number | null>(null);
  const [maxLevel, setMaxLevel] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answeredOffset, setAnsweredOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundStates, setRoundStates] = useState<Record<string, RoundState>>({});
  const [guess, setGuess] = useState("");
  const [isHinting, setIsHinting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  function loadSession(restart: boolean) {
    let cancelled = false;
    setIsLoading(true);

    apiFetch<{
      success: boolean;
      data: {
        session: { id: string; score: number; totalQuestions: number; correctCount: number };
        rounds: CharacterRound[];
        levelNumber: number | null;
        maxLevel: number | null;
      };
    }>("/games/characters/sessions", {
      method: "POST",
      body: JSON.stringify({ playerId, categorySlug: levelSlug, restart }),
    })
      .then((response) => {
        if (!cancelled) {
          setSessionId(response.data.session.id);
          setRounds(response.data.rounds);
          setLevelNumber(response.data.levelNumber);
          setMaxLevel(response.data.maxLevel);
          setTotalQuestions(response.data.session.totalQuestions);
          setAnsweredOffset(response.data.session.totalQuestions - response.data.rounds.length);
          setSessionScore(response.data.session.score);
          setCorrectCount(response.data.session.correctCount);
          setCurrentIndex(0);
          setRoundStates({});
        }
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) setError(fetchError instanceof Error ? fetchError.message : "Could not start Who Am I?");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }

  useEffect(() => {
    if (!playerId) return;
    return loadSession(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, levelSlug]);

  function startOver() {
    if (!confirm("Start this level over from the first character? Your progress so far on this level will be replaced.")) return;
    loadSession(true);
  }

  const round = rounds?.[currentIndex];
  const state: RoundState = round
    ? roundStates[round.characterId] ?? { clues: [round.firstClue], hintsUsed: 0 }
    : { clues: [], hintsUsed: 0 };

  async function requestHint() {
    if (!sessionId || !round || isHinting || state.answer || state.hintsUsed >= 2) return;
    setIsHinting(true);

    try {
      const response = await apiFetch<{ success: boolean; data: CharacterHintResult }>("/games/characters/hints", {
        method: "POST",
        body: JSON.stringify({ sessionId, characterId: round.characterId }),
      });

      setRoundStates((previous) => ({
        ...previous,
        [round.characterId]: {
          ...state,
          hintsUsed: response.data.hintNumber,
          clues: response.data.clue ? [...state.clues, response.data.clue] : state.clues,
        },
      }));
    } catch (hintError) {
      setError(hintError instanceof Error ? hintError.message : "Could not get a hint");
    } finally {
      setIsHinting(false);
    }
  }

  async function submitGuess() {
    if (!sessionId || !round || isSubmitting || !guess.trim() || state.answer) return;
    setIsSubmitting(true);

    try {
      const response = await apiFetch<{
        success: boolean;
        data: { result: CharacterGuessResult; player: { xp: number } };
      }>("/games/characters/answers", {
        method: "POST",
        body: JSON.stringify({ sessionId, characterId: round.characterId, guess: guess.trim() }),
      });

      setRoundStates((previous) => ({ ...previous, [round.characterId]: { ...state, answer: response.data.result } }));
      setSessionScore((value) => value + response.data.result.pointsEarned);
      if (response.data.result.isCorrect) setCorrectCount((value) => value + 1);
      setTotalXp(response.data.player.xp);
      setGuess("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit your guess");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isPlayerLoading || isLoading) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading Who Am I?...</h2>
      </section>
    );
  }

  if (playerError || error || !rounds || !round) {
    const isFinished = rounds && currentIndex >= rounds.length;
    if (isFinished) {
      const ratio = totalQuestions > 0 ? correctCount / totalQuestions : 0;
      const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : ratio > 0 ? 1 : 0;
      const lastRound = rounds[rounds.length - 1];
      const nextLevelSlug = lastRound ? roundStates[lastRound.characterId]?.answer?.nextLevelSlug : null;

      return (
        <LevelCompleteScreen
          label="WHO AM I? COMPLETE"
          passed={correctCount > 0}
          stars={stars}
          levelScore={sessionScore}
          xpEarned={sessionScore}
          totalScore={totalXp}
          continueLabel={nextLevelSlug ? "Next Level" : "Back to Levels"}
          onContinue={() => router.push((nextLevelSlug ? `/who-am-i/${nextLevelSlug}` : "/who-am-i") as Route)}
          onBackToLevels={() => router.push("/who-am-i")}
        />
      );
    }
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">Who Am I? isn&apos;t ready yet</h2>
        <p className="text-sm text-slate-600">{playerError || error}</p>
      </section>
    );
  }

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-slate-900">Who Am I?</h2>
        <div className="flex flex-wrap gap-3">
          {levelNumber ? (
            <span className="rounded-full bg-gold-50 px-4 py-2 text-sm font-semibold text-gold-700">
              Level {levelNumber}/{maxLevel}
            </span>
          ) : null}
          <span className="rounded-full bg-gold-100 px-4 py-2 text-sm font-semibold text-gold-700">
            Character {answeredOffset + currentIndex + 1} of {totalQuestions}
          </span>
          {answeredOffset > 0 ? (
            <button type="button" onClick={startOver} className="text-xs font-semibold text-slate-400 underline hover:text-slate-600">
              Start over
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-gold-200">Clues</p>
        <ul className="mt-3 grid gap-2">
          {state.clues.map((clue, index) => (
            <li key={index} className="text-lg font-semibold leading-relaxed">
              {index + 1}. {clue}
            </li>
          ))}
        </ul>
      </div>

      {state.answer ? (
        <div className={`rounded-2xl px-4 py-4 text-base font-semibold ${state.answer.isCorrect ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
          {state.answer.isCorrect
            ? `Correct! It was ${state.answer.correctName}. +${state.answer.pointsEarned} points.`
            : `Not quite. It was ${state.answer.correctName}.`}
        </div>
      ) : (
        <div className="grid gap-3">
          <input
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && submitGuess()}
            placeholder="Type your guess..."
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-gold-400 focus:ring-4 focus:ring-gold-100"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submitGuess}
              disabled={isSubmitting || !guess.trim()}
              className="rounded-full bg-gold-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Checking..." : "Guess"}
            </button>
            <button
              type="button"
              onClick={requestHint}
              disabled={isHinting || state.hintsUsed >= 2}
              className="rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-amber-950 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              💡 {2 - state.hintsUsed > 0 ? `Hint (-2 pts) · ${2 - state.hintsUsed} left` : "No hints left"}
            </button>
          </div>
        </div>
      )}

      {state.answer ? (
        <button
          type="button"
          onClick={() => setCurrentIndex((value) => value + 1)}
          className="justify-self-start rounded-full bg-royal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-royal-700"
        >
          {currentIndex >= rounds.length - 1 ? "Finish" : "Next Character →"}
        </button>
      ) : null}
    </section>
  );
}
