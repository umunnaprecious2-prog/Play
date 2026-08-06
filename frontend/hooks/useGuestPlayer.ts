"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { createGuestNickname } from "../lib/guest";
import { getStoredPlayerId, setStoredNickname, setStoredPlayerId } from "../lib/player";
import type { PlayerProfile } from "../lib/types";

// Ensures the browser has a persisted player id so XP, streaks, badges, and
// avatars accumulate across page loads instead of resetting on every visit.
// Reuses the id already in localStorage if one exists; otherwise creates a
// new guest player once and remembers it for next time.
export function useGuestPlayer() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function ensurePlayer() {
      const existingId = getStoredPlayerId();

      if (existingId) {
        if (!cancelled) {
          setPlayerId(existingId);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await apiFetch<{ success: boolean; data: PlayerProfile }>("/games/players", {
          method: "POST",
          body: JSON.stringify({ nickname: createGuestNickname("guest"), avatarSlug: "sunbeam-lion" }),
        });

        setStoredPlayerId(response.data.id);
        setStoredNickname(response.data.nickname);

        if (!cancelled) {
          setPlayerId(response.data.id);
          setIsLoading(false);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Could not create a player");
          setIsLoading(false);
        }
      }
    }

    void ensurePlayer();

    return () => {
      cancelled = true;
    };
  }, []);

  return { playerId, isLoading, error };
}
