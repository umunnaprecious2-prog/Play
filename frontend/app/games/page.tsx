import Link from "next/link";
import type { Route } from "next";
import { GameCard } from "../../components/GameCard";
import { GAMES } from "../../lib/games";

export default function GamesPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 text-center shadow-soft backdrop-blur sm:p-8">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">The Arcade</span>
          <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-black text-slate-900 sm:text-4xl">Choose Your Game</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
            All ten games are live today. Every verse quoted anywhere on Play is the King James Version, exactly as
            written. Pick a game to set up your nickname and avatar, then start playing.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          {GAMES.map((game) => (
            <GameCard
              key={game.slug}
              title={game.title}
              description={game.description}
              href={`/games/${game.slug}` as Route}
              accent={game.accent}
              icon={game.icon}
            />
          ))}
        </div>

        <p className="pt-2 text-center text-sm text-slate-500">
          Just want a quick 5-question round instead?{" "}
          <Link href="/quiz" className="font-semibold text-royal-600 hover:underline">
            Try Quick Practice
          </Link>
        </p>
      </div>
    </main>
  );
}
