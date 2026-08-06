"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import { LevelCompleteScreen } from "./LevelCompleteScreen";
import type { ScripturePuzzleAnswerResult, ScripturePuzzleHintResult } from "../lib/types";

type PuzzleTile = { id: string; word: string };

export function ScripturePuzzle() {
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [verseId, setVerseId] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [pool, setPool] = useState<PuzzleTile[]>([]);
  const [placed, setPlaced] = useState<PuzzleTile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hintsUsed, setHintsUsed] = useState(0);
  const [isHinting, setIsHinting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ScripturePuzzleAnswerResult | null>(null);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    if (!playerId) return;

    let cancelled = false;
    setIsLoading(true);

    apiFetch<{ success: boolean; data: { session: { id: string }; verse: { id: string; reference: string }; scrambledWords: string[] } }>(
      "/games/scripture-puzzle/sessions",
      { method: "POST", body: JSON.stringify({ playerId }) },
    )
      .then((response) => {
        if (!cancelled) {
          setSessionId(response.data.session.id);
          setVerseId(response.data.verse.id);
          setReference(response.data.verse.reference);
          setPool(response.data.scrambledWords.map((word, index) => ({ id: `${index}-${word}`, word })));
        }
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) setError(fetchError instanceof Error ? fetchError.message : "Could not start Scripture Puzzle");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  function moveToPlaced(tile: PuzzleTile) {
    if (result) return;
    setPool((current) => current.filter((item) => item.id !== tile.id));
    setPlaced((current) => [...current, tile]);
  }

  function moveToPool(tile: PuzzleTile) {
    if (result) return;
    setPlaced((current) => current.filter((item) => item.id !== tile.id));
    setPool((current) => [...current, tile]);
  }

  async function requestHint() {
    if (!sessionId || !verseId || isHinting || hintsUsed >= 2) return;
    setIsHinting(true);

    try {
      const response = await apiFetch<{ success: boolean; data: ScripturePuzzleHintResult }>("/games/scripture-puzzle/hints", {
        method: "POST",
        body: JSON.stringify({ sessionId, verseId }),
      });
      setHintsUsed(response.data.hintNumber);
    } catch (hintError) {
      setError(hintError instanceof Error ? hintError.message : "Could not get a hint");
    } finally {
      setIsHinting(false);
    }
  }

  async function submitPuzzle() {
    if (!sessionId || !verseId || isSubmitting || pool.length > 0) return;
    setIsSubmitting(true);

    try {
      const response = await apiFetch<{
        success: boolean;
        data: { result: ScripturePuzzleAnswerResult; player?: { xp: number } };
      }>("/games/scripture-puzzle/answers", {
        method: "POST",
        body: JSON.stringify({ sessionId, verseId, orderedWords: placed.map((tile) => tile.word) }),
      });
      setResult(response.data.result);
      if (response.data.player) setTotalXp(response.data.player.xp);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit your answer");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isPlayerLoading || isLoading) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading Scripture Puzzle...</h2>
      </section>
    );
  }

  if (playerError || error || !sessionId) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">Scripture Puzzle isn&apos;t ready yet</h2>
        <p className="text-sm text-slate-600">{playerError || error}</p>
      </section>
    );
  }

  if (result) {
    const stars = !result.isCorrect ? 0 : result.hintsUsed === 0 ? 3 : result.hintsUsed === 1 ? 2 : 1;

    return (
      <LevelCompleteScreen
        label={result.isCorrect ? "PUZZLE SOLVED" : "PUZZLE COMPLETE"}
        passed={result.isCorrect}
        stars={stars}
        levelScore={result.pointsEarned}
        xpEarned={result.pointsEarned}
        totalScore={totalXp}
        continueLabel="Next Puzzle"
        onContinue={() => window.location.reload()}
      />
    );
  }

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">Scripture Puzzle</h2>
        <span className="rounded-full bg-royal-50 px-4 py-2 text-sm font-semibold text-royal-700">{reference} (KJV)</span>
      </div>

      <div className="min-h-[100px] rounded-2xl border-2 border-dashed border-royal-200 bg-royal-50/50 p-4">
        <div className="flex flex-wrap gap-2">
          {placed.length === 0 ? (
            <p className="text-sm text-slate-500">Tap words below to build the verse in order.</p>
          ) : (
            placed.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => moveToPool(tile)}
                className="rounded-xl bg-royal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-royal-700"
              >
                {tile.word}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {pool.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => moveToPlaced(tile)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-royal-300 hover:bg-royal-50"
          >
            {tile.word}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={requestHint}
          disabled={isHinting || hintsUsed >= 2}
          className="rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-amber-950 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          💡 {2 - hintsUsed > 0 ? `Hint (-2 pts) · ${2 - hintsUsed} left` : "No hints left"}
        </button>
        <button
          type="button"
          onClick={submitPuzzle}
          disabled={pool.length > 0 || isSubmitting}
          className="rounded-full bg-royal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-royal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Checking..." : "Check My Answer"}
        </button>
      </div>
    </section>
  );
}
