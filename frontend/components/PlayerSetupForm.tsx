"use client";

import { useState } from "react";
import { apiFetch } from "../lib/api";
import type { PlayerProfile } from "../lib/types";

type PlayerSetupFormProps = {
  onCreated(player: PlayerProfile): void;
};

export function PlayerSetupForm({ onCreated }: PlayerSetupFormProps) {
  const [nickname, setNickname] = useState("");
  const [avatarSlug, setAvatarSlug] = useState("sunbeam-lion");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<{ success: boolean; data: PlayerProfile }>("/games/players", {
        method: "POST",
        body: JSON.stringify({ nickname, avatarSlug }),
      });

      onCreated(response.data);
      setNickname("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create player");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Create a player</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">This lets kids save progress, streaks, badges, and avatars.</p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Nickname</span>
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="Little Lamp"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-sunrise-400 focus:ring-4 focus:ring-sunrise-100"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Avatar</span>
        <select
          value={avatarSlug}
          onChange={(event) => setAvatarSlug(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        >
          <option value="sunbeam-lion">Sunbeam Lion</option>
          <option value="gentle-sheep">Gentle Sheep</option>
          <option value="star-harbor-kid">Star Harbor Kid</option>
        </select>
      </label>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-full bg-sunrise-500 px-6 py-3 text-base font-bold text-white transition hover:bg-sunrise-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Creating..." : "Start Adventure"}
      </button>
    </form>
  );
}