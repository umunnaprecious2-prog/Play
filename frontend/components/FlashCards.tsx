"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import { LevelCompleteScreen } from "./LevelCompleteScreen";
import type { FlashCard } from "../lib/types";

export function FlashCards() {
  const router = useRouter();
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cards, setCards] = useState<FlashCard[] | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knewCount, setKnewCount] = useState(0);
  const [completion, setCompletion] = useState<{ xpAwarded: number; starsAwarded: number } | null>(null);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    if (!playerId) return;

    let cancelled = false;
    setIsLoading(true);

    apiFetch<{ success: boolean; data: { session: { id: string }; level: number; cards: FlashCard[] } }>(
      "/games/flashcards/sessions",
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
        if (!cancelled) setError(fetchError instanceof Error ? fetchError.message : "Could not start Flash Cards");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  async function respond(knew: boolean) {
    if (!cards) return;
    const nextKnewCount = knewCount + (knew ? 1 : 0);
    setKnewCount(nextKnewCount);

    if (currentIndex >= cards.length - 1) {
      if (!sessionId) return;
      try {
        const response = await apiFetch<{
          success: boolean;
          data: { result: { xpAwarded: number; starsAwarded: number }; player: { xp: number } };
        }>("/games/flashcards/complete", {
          method: "POST",
          body: JSON.stringify({ sessionId, knewCount: nextKnewCount }),
        });
        setCompletion(response.data.result);
        setTotalXp(response.data.player.xp);
      } catch (finishError) {
        setError(finishError instanceof Error ? finishError.message : "Could not finish Flash Cards");
      }
      return;
    }

    setCurrentIndex((value) => value + 1);
    setIsFlipped(false);
  }

  if (isPlayerLoading || isLoading) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading Flash Cards...</h2>
      </section>
    );
  }

  if (playerError || error || !cards) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">Flash Cards aren&apos;t ready yet</h2>
        <p className="text-sm text-slate-600">{playerError || error}</p>
      </section>
    );
  }

  if (completion) {
    const ratio = cards.length > 0 ? knewCount / cards.length : 0;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : ratio > 0 ? 1 : 0;

    return (
      <LevelCompleteScreen
        label={`LEVEL ${level ?? 1} COMPLETE`}
        passed
        stars={stars}
        levelScore={completion.xpAwarded}
        xpEarned={completion.xpAwarded}
        totalScore={totalXp}
        continueLabel="Next Level"
        onContinue={() => router.push("/flashcards/play")}
        onBackToLevels={() => router.push("/flashcards")}
      />
    );
  }

  const card = cards[currentIndex];

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">Flash Cards</h2>
        <div className="flex flex-wrap gap-3">
          {level ? (
            <span className="rounded-full bg-gold-50 px-4 py-2 text-sm font-semibold text-gold-700">Level {level}/20</span>
          ) : null}
          <span className="rounded-full bg-sunrise-50 px-4 py-2 text-sm font-semibold text-sunrise-700">
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsFlipped((value) => !value)}
        className="grid min-h-[220px] place-items-center rounded-[1.5rem] bg-slate-950 p-8 text-center text-white shadow-lg transition hover:bg-slate-900"
      >
        {!isFlipped ? (
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sunrise-200">Tap to reveal</p>
            <h3 className="mt-3 text-3xl font-black">{card.reference}</h3>
            {card.memoryHint ? <p className="mt-3 text-sm text-slate-300">{card.memoryHint}</p> : null}
          </div>
        ) : (
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sunrise-200">{card.reference} (KJV)</p>
            <p className="mt-3 text-xl font-bold leading-relaxed">{card.text}</p>
          </div>
        )}
      </button>

      {isFlipped ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => respond(true)}
            className="flex-1 rounded-full bg-meadow-500 px-6 py-3 text-base font-bold text-white transition hover:bg-meadow-600"
          >
            ✅ I knew it
          </button>
          <button
            type="button"
            onClick={() => respond(false)}
            className="flex-1 rounded-full bg-slate-200 px-6 py-3 text-base font-bold text-slate-700 transition hover:bg-slate-300"
          >
            🔄 Still learning
          </button>
        </div>
      ) : (
        <p className="text-center text-sm text-slate-500">Tap the card to see the verse, then rate yourself.</p>
      )}
    </section>
  );
}
