"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import type { Level } from "../lib/types";

const ACCENTS = ["bg-sunrise-500", "bg-sky-500", "bg-meadow-500"];

export function LevelMap() {
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [levels, setLevels] = useState<Level[] | null>(null);
  const [isLoadingLevels, setIsLoadingLevels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) {
      return;
    }

    let cancelled = false;
    setIsLoadingLevels(true);
    setError(null);

    apiFetch<{ success: boolean; data: Level[] }>(`/games/levels?playerId=${encodeURIComponent(playerId)}`)
      .then((response) => {
        if (!cancelled) {
          setLevels(response.data);
        }
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Could not load levels");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingLevels(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  if (isPlayerLoading || isLoadingLevels) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading levels...</h2>
      </section>
    );
  }

  if (playerError || error || !levels) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">Levels aren&apos;t ready yet</h2>
        <p className="text-sm leading-6 text-slate-600">{playerError || error}</p>
      </section>
    );
  }

  const completedCount = levels.filter((level) => level.isCompleted).length;

  return (
    <section className="grid gap-6 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Bible Quiz Levels</h2>
          <p className="mt-1 text-sm text-slate-600">Complete a level to unlock the next one.</p>
        </div>
        <span className="rounded-full bg-sunrise-50 px-4 py-2 text-sm font-semibold text-sunrise-700">
          {completedCount}/{levels.length} complete
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {levels.map((level, index) => {
          const accent = ACCENTS[index % ACCENTS.length];
          const content = (
            <div
              className={`flex items-center gap-4 rounded-[1.5rem] border p-5 transition ${
                level.isUnlocked
                  ? "border-white/70 bg-white shadow-soft hover:-translate-y-1 hover:shadow-xl"
                  : "border-slate-100 bg-slate-50 opacity-70"
              }`}
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg ${
                  level.isUnlocked ? accent : "bg-slate-300"
                }`}
              >
                {level.isCompleted ? "★" : level.isUnlocked ? level.levelNumber : "🔒"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-black text-slate-900">
                  Level {level.levelNumber}: {level.name}
                </p>
                {level.isUnlocked ? (
                  <p className="mt-1 text-sm text-slate-600">
                    {level.isCompleted ? `Completed — best score ${level.bestScore}` : `${level.totalQuestions} questions · 10 pts each`}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">Complete Level {level.levelNumber - 1} to unlock</p>
                )}
              </div>
              {level.isUnlocked ? (
                <span className="shrink-0 rounded-full bg-slate-900/5 px-3 py-1 text-sm font-semibold text-slate-700">
                  {level.isCompleted ? "Replay" : "Play"}
                </span>
              ) : null}
            </div>
          );

          return level.isUnlocked ? (
            <Link key={level.id} href={`/levels/${level.slug}`}>
              {content}
            </Link>
          ) : (
            <div key={level.id}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}
