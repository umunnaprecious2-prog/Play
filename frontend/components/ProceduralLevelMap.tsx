"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import { SnakeLevelMap, type SnakeLevelNode } from "./SnakeLevelMap";

type ProceduralLevelMapProps = {
  endpoint: string;
  basePath: string;
  title: string;
  subtitle?: string;
  accent?: "sunrise" | "sky" | "meadow" | "royal" | "gold";
};

// Level map for the "procedural difficulty" games (Match the Verse, Flash
// Cards, Trivia) -- unlike the collection games, there's no fixed content
// per level, just an escalating-difficulty round number derived server-side
// from how many sessions this player has completed. So there's nothing to
// revisit: only the current level is ever clickable (routes to `${basePath}/play`),
// everything before it shows as completed, everything after stays locked.
export function ProceduralLevelMap({ endpoint, basePath, title, subtitle, accent }: ProceduralLevelMapProps) {
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [levelInfo, setLevelInfo] = useState<{ currentLevel: number; maxLevel: number } | null>(null);
  const [isLoadingLevel, setIsLoadingLevel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) {
      return;
    }

    let cancelled = false;
    setIsLoadingLevel(true);
    setError(null);

    apiFetch<{ success: boolean; data: { currentLevel: number; maxLevel: number } }>(
      `${endpoint}?playerId=${encodeURIComponent(playerId)}`,
    )
      .then((response) => {
        if (!cancelled) {
          setLevelInfo(response.data);
        }
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Could not load your level");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingLevel(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [playerId, endpoint]);

  if (isPlayerLoading || isLoadingLevel) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading levels...</h2>
      </section>
    );
  }

  if (playerError || error || !levelInfo) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">Levels aren&apos;t ready yet</h2>
        <p className="text-sm leading-6 text-slate-600">{playerError || error}</p>
      </section>
    );
  }

  const { currentLevel, maxLevel } = levelInfo;

  const nodes: SnakeLevelNode[] = Array.from({ length: maxLevel }, (_, index) => {
    const levelNumber = index + 1;
    const isCurrent = levelNumber === currentLevel;

    return {
      id: String(levelNumber),
      slug: isCurrent ? "play" : String(levelNumber),
      levelNumber,
      label: `Level ${levelNumber}`,
      isUnlocked: isCurrent,
      isCompleted: levelNumber < currentLevel,
    };
  });

  return <SnakeLevelMap title={title} subtitle={subtitle} levels={nodes} basePath={basePath} accent={accent} />;
}
