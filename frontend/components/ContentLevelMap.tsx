"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import { SnakeLevelMap, type SnakeLevelNode } from "./SnakeLevelMap";

type ContentLevel = {
  id: string;
  slug: string;
  title: string;
  levelNumber: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  bestScore: number;
  attempts: number;
};

type ContentLevelMapProps = {
  endpoint: string;
  basePath: string;
  title: string;
  subtitle?: string;
  accent?: "sunrise" | "sky" | "meadow" | "royal" | "gold";
};

// Thin data-fetching wrapper around SnakeLevelMap for every "collection"
// game (each level = one fixed piece of content, backed by the shared
// contentProgressService.ts endpoints). Reused by Word Search, Scripture
// Puzzle, Character Guess, and Story Challenge instead of 4 copies of the
// same fetch/loading/error boilerplate.
export function ContentLevelMap({ endpoint, basePath, title, subtitle, accent }: ContentLevelMapProps) {
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [levels, setLevels] = useState<ContentLevel[] | null>(null);
  const [isLoadingLevels, setIsLoadingLevels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) {
      return;
    }

    let cancelled = false;
    setIsLoadingLevels(true);
    setError(null);

    apiFetch<{ success: boolean; data: ContentLevel[] }>(`${endpoint}?playerId=${encodeURIComponent(playerId)}`)
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
  }, [playerId, endpoint]);

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

  const nodes: SnakeLevelNode[] = levels.map((level) => ({
    id: level.id,
    slug: level.slug,
    levelNumber: level.levelNumber,
    label: `Level ${level.levelNumber}`,
    isUnlocked: level.isUnlocked,
    isCompleted: level.isCompleted,
  }));

  return <SnakeLevelMap title={title} subtitle={subtitle} levels={nodes} basePath={basePath} accent={accent} />;
}
