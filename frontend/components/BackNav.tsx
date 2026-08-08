"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Route } from "next";

// Deterministic "go back" target per route, not reliant on browser history.
// Browser back is unreliable here on purpose: a player who launches the app
// fresh (a PWA icon tap, a reopened tab, a reload mid-level) has no in-app
// history to go back through, and falling through to browser history would
// just kick them out of the app entirely -- exactly the "stuck on mobile"
// problem this exists to fix. Every route always resolves to a real place.
function backTargetFor(pathname: string): string | null {
  if (pathname === "/") return null; // nothing above home

  const oneLevelUp = pathname.match(/^\/(games|levels|word-search|scripture-puzzle|who-am-i|story-challenge)\/[^/]+$/);
  if (oneLevelUp) return `/${oneLevelUp[1]}`;

  const proceduralPlay = pathname.match(/^\/(match-the-verse|flashcards|trivia|memory-verse)\/play$/);
  if (proceduralPlay) return `/${proceduralPlay[1]}`;

  const topLevelGamePages = [
    "/levels",
    "/word-search",
    "/scripture-puzzle",
    "/who-am-i",
    "/story-challenge",
    "/match-the-verse",
    "/flashcards",
    "/trivia",
    "/quiz",
    "/memory-verse",
    "/daily-challenge",
  ];
  if (topLevelGamePages.includes(pathname)) return "/games";

  // /games, /account, /download, /privacy, /terms, and anything unlisted
  return "/";
}

// A single, always-present Back control mounted once in the root layout, so
// every page gets it without per-page wiring -- important on mobile/PWA,
// where there's no browser chrome back button to fall back on mid-game.
export function BackNav() {
  const pathname = usePathname();
  const router = useRouter();
  const target = backTargetFor(pathname);

  if (!target) return null;

  return (
    <div className="sticky top-0 z-50 border-b border-white/60 bg-white/70 px-4 py-2 backdrop-blur sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => router.push(target as Route)}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-soft transition hover:-translate-x-0.5 hover:text-royal-600 active:scale-95"
        >
          <span aria-hidden>←</span> Back
        </button>
      </div>
    </div>
  );
}
