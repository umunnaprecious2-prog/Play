"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import { LevelCompleteScreen } from "./LevelCompleteScreen";
import type { ScripturePuzzleAnswerResult, ScripturePuzzleHintResult } from "../lib/types";

type PuzzleTile = { id: string; word: string };
type VerseItem = { id: string; slug: string; reference: string; scrambledWords: string[] };

export function ScripturePuzzle({ levelSlug }: { levelSlug: string }) {
  const router = useRouter();
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [verses, setVerses] = useState<VerseItem[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pool, setPool] = useState<PuzzleTile[]>([]);
  const [placed, setPlaced] = useState<PuzzleTile[]>([]);
  const [levelNumber, setLevelNumber] = useState<number | null>(null);
  const [maxLevel, setMaxLevel] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answeredOffset, setAnsweredOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hintsUsed, setHintsUsed] = useState(0);
  const [isHinting, setIsHinting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answer, setAnswer] = useState<ScripturePuzzleAnswerResult | null>(null);
  const [levelResult, setLevelResult] = useState<ScripturePuzzleAnswerResult | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  function loadSession(restart: boolean) {
    let cancelled = false;
    setIsLoading(true);

    apiFetch<{
      success: boolean;
      data: {
        session: { id: string; score: number; totalQuestions: number };
        verses: VerseItem[];
        levelNumber: number;
        maxLevel: number;
      };
    }>("/games/scripture-puzzle/sessions", { method: "POST", body: JSON.stringify({ playerId, categorySlug: levelSlug, restart }) })
      .then((response) => {
        if (!cancelled) {
          setSessionId(response.data.session.id);
          setVerses(response.data.verses);
          setPool(response.data.verses[0].scrambledWords.map((word, index) => ({ id: `${index}-${word}`, word })));
          setLevelNumber(response.data.levelNumber);
          setMaxLevel(response.data.maxLevel);
          setTotalQuestions(response.data.session.totalQuestions);
          setAnsweredOffset(response.data.session.totalQuestions - response.data.verses.length);
          setSessionScore(response.data.session.score);
          setCurrentIndex(0);
          setPlaced([]);
          setHintsUsed(0);
          setAnswer(null);
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
  }

  useEffect(() => {
    if (!playerId) return;
    return loadSession(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, levelSlug]);

  function startOver() {
    if (!confirm("Start this level over from the first verse? Your progress so far on this level will be replaced.")) return;
    loadSession(true);
  }

  const verse = verses?.[currentIndex];

  function moveToPlaced(tile: PuzzleTile) {
    if (answer) return;
    setPool((current) => current.filter((item) => item.id !== tile.id));
    setPlaced((current) => [...current, tile]);
  }

  function moveToPool(tile: PuzzleTile) {
    if (answer) return;
    setPlaced((current) => current.filter((item) => item.id !== tile.id));
    setPool((current) => [...current, tile]);
  }

  async function requestHint() {
    if (!sessionId || !verse || isHinting || hintsUsed >= 2) return;
    setIsHinting(true);

    try {
      const response = await apiFetch<{ success: boolean; data: ScripturePuzzleHintResult }>("/games/scripture-puzzle/hints", {
        method: "POST",
        body: JSON.stringify({ sessionId, verseId: verse.id }),
      });
      setHintsUsed(response.data.hintNumber);
    } catch (hintError) {
      setError(hintError instanceof Error ? hintError.message : "Could not get a hint");
    } finally {
      setIsHinting(false);
    }
  }

  async function submitPuzzle() {
    if (!sessionId || !verse || isSubmitting || pool.length > 0) return;
    setIsSubmitting(true);

    try {
      const response = await apiFetch<{
        success: boolean;
        data: { result: ScripturePuzzleAnswerResult; player?: { xp: number } };
      }>("/games/scripture-puzzle/answers", {
        method: "POST",
        body: JSON.stringify({ sessionId, verseId: verse.id, orderedWords: placed.map((tile) => tile.word) }),
      });
      setAnswer(response.data.result);
      setSessionScore((value) => value + response.data.result.pointsEarned);
      if (response.data.player) setTotalXp(response.data.player.xp);
      if (response.data.result.isComplete) setLevelResult(response.data.result);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit your answer");
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToNextVerse() {
    if (!verses) return;
    const nextIndex = currentIndex + 1;
    const next = verses[nextIndex];
    if (!next) return;
    setCurrentIndex(nextIndex);
    setPool(next.scrambledWords.map((word, index) => ({ id: `${index}-${word}`, word })));
    setPlaced([]);
    setHintsUsed(0);
    setAnswer(null);
  }

  if (isPlayerLoading || isLoading) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading Scripture Puzzle...</h2>
      </section>
    );
  }

  if (playerError || error || !sessionId || !verse || !verses) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">Scripture Puzzle isn&apos;t ready yet</h2>
        <p className="text-sm text-slate-600">{playerError || error}</p>
      </section>
    );
  }

  if (levelResult) {
    const ratio = totalQuestions > 0 ? sessionScore / (totalQuestions * POINTS_MAX) : 0;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : ratio > 0 ? 1 : 0;

    return (
      <LevelCompleteScreen
        label={levelResult.nextLevelSlug || levelResult.isCorrect ? "LEVEL COMPLETE" : "LEVEL CHALLENGE"}
        passed={Boolean(levelResult.nextLevelSlug)}
        stars={stars}
        levelScore={sessionScore}
        xpEarned={sessionScore}
        totalScore={totalXp}
        continueLabel={levelResult.nextLevelSlug ? "Next Level" : "Back to Levels"}
        onContinue={() =>
          router.push((levelResult.nextLevelSlug ? `/scripture-puzzle/${levelResult.nextLevelSlug}` : "/scripture-puzzle") as Route)
        }
        onBackToLevels={() => router.push("/scripture-puzzle")}
      />
    );
  }

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-slate-900">Scripture Puzzle</h2>
        <div className="flex flex-wrap gap-3">
          {levelNumber ? (
            <span className="rounded-full bg-gold-50 px-4 py-2 text-sm font-semibold text-gold-700">
              Level {levelNumber}/{maxLevel}
            </span>
          ) : null}
          <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
            Verse {answeredOffset + currentIndex + 1} of {totalQuestions}
          </span>
          <span className="rounded-full bg-royal-50 px-4 py-2 text-sm font-semibold text-royal-700">{verse.reference} (KJV)</span>
          {answeredOffset > 0 ? (
            <button type="button" onClick={startOver} className="text-xs font-semibold text-slate-400 underline hover:text-slate-600">
              Start over
            </button>
          ) : null}
        </div>
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

      {answer ? (
        <div className={`rounded-2xl px-4 py-4 text-base font-semibold ${answer.isCorrect ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
          {answer.isCorrect ? `Correct! +${answer.pointsEarned} points.` : `Not quite. The verse is: "${answer.correctText}"`}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {!answer ? (
          <>
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
          </>
        ) : (
          <button
            type="button"
            onClick={goToNextVerse}
            className="rounded-full bg-royal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-royal-700"
          >
            Next Verse →
          </button>
        )}
      </div>
    </section>
  );
}

const POINTS_MAX = 10;
