"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import { LevelCompleteScreen } from "./LevelCompleteScreen";
import type { VerseMatchCard } from "../lib/types";

export function MatchTheVerse() {
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cards, setCards] = useState<VerseMatchCard[] | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matchedVerseIds, setMatchedVerseIds] = useState<Set<string>>(new Set());
  const [mistakeCount, setMistakeCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [completion, setCompletion] = useState<{ xpAwarded: number; starsAwarded: number; isPerfect: boolean } | null>(null);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    if (!playerId) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    apiFetch<{ success: boolean; data: { session: { id: string }; level: number; cards: VerseMatchCard[] } }>(
      "/games/verse-match/sessions",
      { method: "POST", body: JSON.stringify({ playerId }) },
    )
      .then((response) => {
        if (!cancelled) {
          setSessionId(response.data.session.id);
          setLevel(response.data.level);
          setCards(response.data.cards);
        }
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) setError(fetchError instanceof Error ? fetchError.message : "Could not start Match the Verse");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  async function finishGame(matchesFound: number, mistakes: number) {
    if (!sessionId) return;

    try {
      const response = await apiFetch<{
        success: boolean;
        data: { result: { xpAwarded: number; starsAwarded: number; isPerfect: boolean }; player: { xp: number } };
      }>("/games/verse-match/complete", {
        method: "POST",
        body: JSON.stringify({ sessionId, matchesFound, mistakeCount: mistakes }),
      });
      setCompletion(response.data.result);
      setTotalXp(response.data.player.xp);
    } catch (finishError) {
      setError(finishError instanceof Error ? finishError.message : "Could not finish the game");
    }
  }

  function handleFlip(cardId: string) {
    if (isChecking || flipped.includes(cardId) || flipped.length >= 2) return;
    const card = cards?.find((c) => c.cardId === cardId);
    if (!card || matchedVerseIds.has(card.verseId)) return;

    const nextFlipped = [...flipped, cardId];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setIsChecking(true);
      const [firstId, secondId] = nextFlipped;
      const first = cards?.find((c) => c.cardId === firstId);
      const second = cards?.find((c) => c.cardId === secondId);

      setTimeout(() => {
        if (first && second && first.verseId === second.verseId && first.cardId !== second.cardId) {
          setMatchedVerseIds((previous) => {
            const next = new Set(previous).add(first.verseId);
            if (cards && next.size === cards.length / 2) {
              void finishGame(next.size, mistakeCount);
            }
            return next;
          });
        } else {
          setMistakeCount((value) => value + 1);
        }
        setFlipped([]);
        setIsChecking(false);
      }, 900);
    }
  }

  if (isPlayerLoading || isLoading) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading Match the Verse...</h2>
      </section>
    );
  }

  if (playerError || error || !cards) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">Match the Verse isn&apos;t ready yet</h2>
        <p className="text-sm text-slate-600">{playerError || error}</p>
      </section>
    );
  }

  if (completion) {
    const stars = completion.isPerfect ? 3 : mistakeCount <= 2 ? 2 : 1;

    return (
      <LevelCompleteScreen
        label={`LEVEL ${level ?? 1} COMPLETE`}
        passed
        stars={stars}
        levelScore={completion.xpAwarded}
        xpEarned={completion.xpAwarded}
        totalScore={totalXp}
        continueLabel="Next Level"
        onContinue={() => window.location.reload()}
      />
    );
  }

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-slate-900">Match the Verse</h2>
        <div className="flex flex-wrap gap-3">
          {level ? (
            <span className="rounded-full bg-gold-50 px-4 py-2 text-sm font-semibold text-gold-700">Level {level}/20</span>
          ) : null}
          <span className="rounded-full bg-meadow-50 px-4 py-2 text-sm font-semibold text-meadow-700">
            {matchedVerseIds.size}/{cards.length / 2} matched
          </span>
          <span className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">{mistakeCount} misses</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.cardId);
          const isMatched = matchedVerseIds.has(card.verseId);
          const isRevealed = isFlipped || isMatched;

          return (
            <button
              key={card.cardId}
              type="button"
              disabled={isMatched || isChecking}
              onClick={() => handleFlip(card.cardId)}
              className={`flex min-h-[100px] items-center justify-center rounded-2xl border p-3 text-center text-sm font-semibold transition disabled:cursor-not-allowed ${
                isMatched
                  ? "border-meadow-300 bg-meadow-50 text-meadow-800"
                  : isRevealed
                    ? "border-royal-300 bg-royal-50 text-royal-900"
                    : "border-slate-200 bg-slate-900 text-white/70 hover:bg-slate-800"
              }`}
            >
              {isRevealed ? card.content : <span className="text-2xl font-black">?</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
