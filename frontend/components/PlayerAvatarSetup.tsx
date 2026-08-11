"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { apiFetch } from "../lib/api";
import { AVATAR_OPTIONS } from "../lib/avatars";
import { setStoredNickname, setStoredPlayerId } from "../lib/player";
import type { PlayerProfile } from "../lib/types";

type PlayerAvatarSetupProps = {
  gameTitle: string;
  redirectTo: Route;
};

// First-time onboarding shown before a guest's first game: pick a nickname
// and an avatar, hit Enter, watch the avatar celebrate, then move on to the
// game itself. Runs once per browser, since the resulting player id is
// persisted in localStorage and every later game reuses it.
export function PlayerAvatarSetup({ gameTitle, redirectTo }: PlayerAvatarSetupProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [avatarSlug, setAvatarSlug] = useState(AVATAR_OPTIONS[0].slug);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const selectedAvatar = AVATAR_OPTIONS.find((option) => option.slug === avatarSlug) ?? AVATAR_OPTIONS[0];
  const trimmedNickname = nickname.trim();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (trimmedNickname.length < 2) {
      setError("Nicknames need at least 2 letters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<{ success: boolean; data: PlayerProfile }>("/games/players", {
        method: "POST",
        body: JSON.stringify({ nickname: trimmedNickname, avatarSlug }),
      });

      setStoredPlayerId(response.data.id);
      setStoredNickname(response.data.nickname);
      setIsLoading(false);
      setCelebrate(true);

      window.setTimeout(() => {
        router.push(redirectTo);
      }, 1400);
    } catch (submitError) {
      setIsLoading(false);
      setError(submitError instanceof Error ? submitError.message : "Could not create player");
    }
  }

  if (celebrate) {
    return (
      <div className="grid justify-items-center gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-10 text-center shadow-soft backdrop-blur">
        <div
          className={`flex h-24 w-24 animate-bounce items-center justify-center rounded-full text-5xl ring-4 ${selectedAvatar.ring}`}
          aria-hidden
        >
          {selectedAvatar.emoji}
        </div>
        <p className="text-2xl font-black text-slate-900">Hi, {trimmedNickname}! 🎉</p>
        <p className="text-base text-slate-600">Getting {gameTitle} ready for you...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur sm:p-8"
    >
      <div className="text-center">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">Before you play</span>
        <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Who's playing {gameTitle}?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Pick a nickname and an avatar. This saves your progress, streaks, and scores as you go.
        </p>
      </div>

      <div className="flex justify-center gap-4">
        {AVATAR_OPTIONS.map((option) => (
          <button
            key={option.slug}
            type="button"
            onClick={() => setAvatarSlug(option.slug)}
            aria-pressed={avatarSlug === option.slug}
            className={`grid justify-items-center gap-2 rounded-2xl border-2 px-6 py-4 transition ${
              avatarSlug === option.slug
                ? `border-transparent ring-4 ${option.ring}`
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span className="text-4xl" aria-hidden>
              {option.emoji}
            </span>
            <span className="text-sm font-bold text-slate-700">{option.label}</span>
          </button>
        ))}
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Nickname</span>
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="Little Lamp"
          autoFocus
          maxLength={40}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-semibold outline-none transition focus:border-sunrise-400 focus:ring-4 focus:ring-sunrise-100"
        />
      </label>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="mx-auto rounded-full bg-sunrise-500 px-8 py-3 text-base font-bold text-white transition hover:bg-sunrise-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Saving..." : "Start Playing →"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/account" className="font-semibold text-royal-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
