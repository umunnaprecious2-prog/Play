"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { PlayerAvatarSetup } from "./PlayerAvatarSetup";
import { getStoredNickname, getStoredPlayerId } from "../lib/player";
import { getGameBySlug } from "../lib/games";

// Gate between "pick a game" and "play the game". A returning guest who
// already has a nickname skips straight through; a first-time guest sets up
// a nickname and avatar here before the actual game ever loads.
export function GameSetupClient() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const game = getGameBySlug(params.slug);
  const [checkedExisting, setCheckedExisting] = useState(false);

  useEffect(() => {
    if (!game) return;

    if (getStoredPlayerId() && getStoredNickname()) {
      router.replace(game.href);
      return;
    }

    setCheckedExisting(true);
  }, [game, router]);

  if (!game) {
    notFound();
  }

  if (!checkedExisting) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-6">
        <p className="text-sm font-semibold text-slate-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6 py-10">
        <PlayerAvatarSetup gameTitle={game.title} redirectTo={game.href} />
      </div>
    </main>
  );
}
