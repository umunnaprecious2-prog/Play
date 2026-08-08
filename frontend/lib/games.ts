import type { Route } from "next";

export type GameConfig = {
  slug: string;
  title: string;
  description: string;
  href: Route;
  icon: string;
  accent: string;
};

// Single source of truth for the ten games: the games list page, the landing
// page teaser, and the per-game setup gate all read from here so a game only
// has to be described in one place.
export const GAMES = [
  {
    slug: "levels",
    title: "Bible Quiz Levels",
    description: "8 levels, 25 questions each, 10 points per question. Hints cost -2 points, up to 2 per question.",
    href: "/levels",
    accent: "border-royal-100",
    icon: "Q",
  },
  {
    slug: "memory-verse",
    title: "Memory Verse",
    description: "Practice verses with gentle repetition, hints, and simple progress tracking for anyone.",
    href: "/memory-verse",
    accent: "border-meadow-100",
    icon: "V",
  },
  {
    slug: "word-search",
    title: "Word Search",
    description: "Find Bible words hidden in a letter grid, themed by category.",
    href: "/word-search",
    icon: "🔎",
    accent: "border-sky-100",
  },
  {
    slug: "scripture-puzzle",
    title: "Scripture Puzzle",
    description: "Rebuild a scrambled verse, word by word, with hints when you're stuck.",
    href: "/scripture-puzzle",
    icon: "🧩",
    accent: "border-gold-100",
  },
  {
    slug: "flashcards",
    title: "Flash Cards",
    description: "Quick-fire verse recall, built for daily practice.",
    href: "/flashcards",
    icon: "🗂️",
    accent: "border-sunrise-100",
  },
  {
    slug: "match-the-verse",
    title: "Match the Verse",
    description: "Pair references with their verses in a memory-match game.",
    href: "/match-the-verse",
    icon: "🔗",
    accent: "border-meadow-100",
  },
  {
    slug: "trivia",
    title: "Bible Trivia",
    description: "Fast, wide-ranging trivia across the whole Bible, 15 seconds a question.",
    href: "/trivia",
    icon: "🎯",
    accent: "border-sky-100",
  },
  {
    slug: "story-challenge",
    title: "Bible Story Challenge",
    description: "Put key story events in the right order.",
    href: "/story-challenge",
    icon: "📜",
    accent: "border-royal-100",
  },
  {
    slug: "who-am-i",
    title: "Character Guessing Game",
    description: "Guess the Bible character from a series of clues.",
    href: "/who-am-i",
    icon: "❓",
    accent: "border-gold-100",
  },
  {
    slug: "daily-challenge",
    title: "Daily Bible Challenge",
    description: "One fresh challenge a day to keep your streak alive.",
    href: "/daily-challenge",
    icon: "📅",
    accent: "border-sunrise-100",
  },
] as const satisfies readonly GameConfig[];

export function getGameBySlug(slug: string) {
  return GAMES.find((game) => game.slug === slug) ?? null;
}
