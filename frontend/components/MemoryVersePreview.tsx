"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import { getStoredNickname } from "../lib/player";
import { QuizResultsScreen } from "./QuizResultsScreen";
import type { GameAnswerResult, PlayerProfile, VerseItem } from "../lib/types";

type AnsweredState = Record<string, GameAnswerResult>;

type MemoryVerseSession = {
  sessionId: string;
  verses: VerseItem[];
};

export function MemoryVersePreview() {
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [session, setSession] = useState<MemoryVerseSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState<AnsweredState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [lastPlayer, setLastPlayer] = useState<PlayerProfile | null>(null);

  function loadSession(id: string) {
    let cancelled = false;
    setIsLoadingSession(true);
    setSessionError(null);

    apiFetch<{ success: boolean; data: { session: { id: string }; verses: VerseItem[] } }>("/games/memory-verse/sessions", {
      method: "POST",
      body: JSON.stringify({ playerId: id, verseCount: 3 }),
    })
      .then((response) => {
        if (!cancelled) {
          setSession({ sessionId: response.data.session.id, verses: response.data.verses });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSessionError(error instanceof Error ? error.message : "Could not start a memory verse session");
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

    return loadSession(playerId);
  }, [playerId]);

  function handlePlayAgain() {
    if (!playerId) {
      return;
    }

    setSession(null);
    setCurrentIndex(0);
    setDraft("");
    setAnswers({});
    setFinished(false);
    setLastPlayer(null);
    loadSession(playerId);
  }

  if (isPlayerLoading || isLoadingSession) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading your verses...</h2>
        <p className="text-sm text-slate-600">Getting a fresh set of verses ready.</p>
      </section>
    );
  }

  if (playerError || sessionError || !session) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">No memory verses available yet</h2>
        <p className="text-sm leading-6 text-slate-600">{playerError || sessionError || "Seed the server database first."}</p>
      </section>
    );
  }

  const { sessionId, verses } = session;
  const isLastVerse = currentIndex === verses.length - 1;

  if (finished && lastPlayer) {
    const answeredList = Object.values(answers);
    const correctCount = answeredList.filter((entry) => entry.isCorrect).length;
    const xpEarned = answeredList.reduce((sum, entry) => sum + entry.xpAwarded, 0);

    return (
      <QuizResultsScreen
        nickname={getStoredNickname() ?? "friend"}
        avatarSlug={lastPlayer.avatarSlug}
        correctCount={correctCount}
        totalCount={verses.length}
        xpEarned={xpEarned}
        totalXp={lastPlayer.xp}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  const verse = verses[currentIndex];

  if (!verse) {
    return null;
  }

  const currentAnswer = answers[verse.id];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (currentAnswer || isSubmitting || draft.trim().length === 0) {
      return;
    }

    setIsSubmitting(true);
    setAnswerError(null);

    try {
      const response = await apiFetch<{ success: boolean; data: { result: GameAnswerResult; player: PlayerProfile } }>(
        "/games/memory-verse/answers",
        {
          method: "POST",
          body: JSON.stringify({ sessionId, verseId: verse.id, answerText: draft }),
        },
      );

      setAnswers((previous) => ({ ...previous, [verse.id]: response.data.result }));
      setLastPlayer(response.data.player);
    } catch (submitError) {
      setAnswerError(submitError instanceof Error ? submitError.message : "Could not submit your answer");
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToIndex(nextIndex: number) {
    setCurrentIndex(Math.max(0, Math.min(verses.length - 1, nextIndex)));
    setDraft("");
    setAnswerError(null);
  }

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <Link href="/games" className="w-fit text-sm font-semibold text-slate-500 transition hover:text-royal-600">
        ← Back to Games
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Memory verse practice</h2>
          <p className="mt-1 text-sm text-slate-600">Short verses, simple prompts, and positive feedback.</p>
        </div>
        <span className="rounded-full bg-meadow-50 px-4 py-2 text-sm font-semibold text-meadow-700">
          {currentIndex + 1}/{verses.length}
        </span>
      </div>

      <div className="rounded-[1.5rem] bg-meadow-50 p-6 shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-meadow-700">{verse.reference}</p>
        <p className="mt-3 text-2xl font-black leading-relaxed text-slate-900">{verse.text}</p>
        {verse.memoryHint ? <p className="mt-3 text-sm font-medium text-slate-600">Hint: {verse.memoryHint}</p> : null}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3">
        <textarea
          rows={4}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={Boolean(currentAnswer) || isSubmitting}
          placeholder="Type the verse from memory or practice a few words at a time"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none transition focus:border-meadow-400 focus:ring-4 focus:ring-meadow-100 disabled:bg-slate-50 disabled:text-slate-500"
        />

        {!currentAnswer ? (
          <button
            type="submit"
            disabled={isSubmitting || draft.trim().length === 0}
            className="rounded-full bg-meadow-500 px-6 py-3 text-base font-bold text-white transition hover:bg-meadow-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Checking..." : "Check my answer"}
          </button>
        ) : null}
      </form>

      {answerError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{answerError}</p> : null}

      {currentAnswer ? (
        <div
          className={`rounded-2xl px-4 py-4 text-base font-semibold ${
            currentAnswer.isCorrect ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"
          }`}
        >
          {currentAnswer.isCorrect
            ? `Wonderful! You earned ${currentAnswer.xpAwarded} XP.`
            : `Nice try! The verse is: "${currentAnswer.correctText}"`}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => goToIndex(currentIndex - 1)}
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={isLastVerse && !currentAnswer}
          onClick={() => {
            if (isLastVerse) {
              setFinished(true);
              return;
            }
            goToIndex(currentIndex + 1);
          }}
          className="rounded-full bg-meadow-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-meadow-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLastVerse ? "See My Results" : "Next"}
        </button>
      </div>
    </section>
  );
}
