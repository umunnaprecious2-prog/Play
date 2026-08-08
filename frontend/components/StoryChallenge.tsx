"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import { LevelCompleteScreen } from "./LevelCompleteScreen";
import type { StoryEventCard, StoryOrderResult } from "../lib/types";

type StoryItem = { id: string; slug: string; title: string; shuffledEvents: StoryEventCard[] };

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function StoryChallenge({ levelSlug }: { levelSlug: string }) {
  const router = useRouter();
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stories, setStories] = useState<StoryItem[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [events, setEvents] = useState<StoryEventCard[] | null>(null);
  const [levelNumber, setLevelNumber] = useState<number | null>(null);
  const [maxLevel, setMaxLevel] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answer, setAnswer] = useState<StoryOrderResult | null>(null);
  const [levelResult, setLevelResult] = useState<StoryOrderResult | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    if (!playerId) return;

    let cancelled = false;
    setIsLoading(true);

    apiFetch<{
      success: boolean;
      data: { session: { id: string }; stories: StoryItem[]; levelNumber: number; maxLevel: number };
    }>("/games/stories/sessions", { method: "POST", body: JSON.stringify({ playerId, categorySlug: levelSlug }) })
      .then((response) => {
        if (!cancelled) {
          setSessionId(response.data.session.id);
          setStories(response.data.stories);
          setEvents(shuffle(response.data.stories[0].shuffledEvents));
          setLevelNumber(response.data.levelNumber);
          setMaxLevel(response.data.maxLevel);
        }
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) setError(fetchError instanceof Error ? fetchError.message : "Could not start the story challenge");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [playerId, levelSlug]);

  const story = stories?.[currentIndex];

  function move(index: number, direction: -1 | 1) {
    if (!events || answer) return;
    const target = index + direction;
    if (target < 0 || target >= events.length) return;
    const next = [...events];
    [next[index], next[target]] = [next[target], next[index]];
    setEvents(next);
  }

  async function submit() {
    if (!sessionId || !story || !events || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await apiFetch<{
        success: boolean;
        data: { result: StoryOrderResult; player: { xp: number } };
      }>("/games/stories/answers", {
        method: "POST",
        body: JSON.stringify({ sessionId, storyId: story.id, orderedEventIds: events.map((event) => event.id) }),
      });
      setAnswer(response.data.result);
      setSessionScore((value) => value + response.data.result.pointsEarned);
      setTotalXp(response.data.player.xp);
      if (response.data.result.isComplete) setLevelResult(response.data.result);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit your order");
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToNextStory() {
    if (!stories) return;
    const nextIndex = currentIndex + 1;
    const next = stories[nextIndex];
    if (!next) return;
    setCurrentIndex(nextIndex);
    setEvents(shuffle(next.shuffledEvents));
    setAnswer(null);
  }

  if (isPlayerLoading || isLoading) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading Bible Story Challenge...</h2>
      </section>
    );
  }

  if (playerError || error || !events || !story || !stories) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">Story Challenge isn&apos;t ready yet</h2>
        <p className="text-sm text-slate-600">{playerError || error}</p>
      </section>
    );
  }

  if (levelResult) {
    return (
      <LevelCompleteScreen
        label={levelResult.nextLevelSlug ? "LEVEL COMPLETE" : "LEVEL CHALLENGE"}
        passed={Boolean(levelResult.nextLevelSlug)}
        stars={levelResult.nextLevelSlug ? 3 : 0}
        levelScore={sessionScore}
        xpEarned={sessionScore}
        totalScore={totalXp}
        continueLabel={levelResult.nextLevelSlug ? "Next Level" : "Back to Levels"}
        onContinue={() => router.push((levelResult.nextLevelSlug ? `/story-challenge/${levelResult.nextLevelSlug}` : "/story-challenge") as Route)}
        onBackToLevels={() => router.push("/story-challenge")}
      />
    );
  }

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-slate-900">{story.title}</h2>
        <div className="flex flex-wrap gap-3">
          {levelNumber ? (
            <span className="rounded-full bg-gold-50 px-4 py-2 text-sm font-semibold text-gold-700">
              Level {levelNumber}/{maxLevel}
            </span>
          ) : null}
          <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
            Story {currentIndex + 1} of {stories.length}
          </span>
          <span className="rounded-full bg-royal-50 px-4 py-2 text-sm font-semibold text-royal-700">Put the events in order</span>
        </div>
      </div>

      <div className="grid gap-3">
        {events.map((event, index) => (
          <div key={event.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-royal-100 text-sm font-black text-royal-700">
              {index + 1}
            </span>
            <p className="flex-1 text-base text-slate-800">{event.text}</p>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0 || Boolean(answer)}
                className="rounded-lg bg-slate-100 px-2 py-1 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === events.length - 1 || Boolean(answer)}
                className="rounded-lg bg-slate-100 px-2 py-1 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>

      {answer ? (
        <div className={`rounded-2xl px-4 py-4 text-base font-semibold ${answer.isCorrect ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
          {answer.isCorrect ? `Correct order! +${answer.pointsEarned} points.` : "Not quite the right order. Take a look and try the next one."}
        </div>
      ) : null}

      {!answer ? (
        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="justify-self-start rounded-full bg-royal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-royal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Checking..." : "Check My Order"}
        </button>
      ) : (
        <button
          type="button"
          onClick={goToNextStory}
          className="justify-self-start rounded-full bg-royal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-royal-700"
        >
          Next Story →
        </button>
      )}
    </section>
  );
}
