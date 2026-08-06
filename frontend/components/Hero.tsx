"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-landing-hero p-8 shadow-glow sm:p-10 lg:p-14">
      <div className="pointer-events-none absolute -right-10 -top-10 text-8xl opacity-20 animate-float" aria-hidden>
        📖
      </div>

      <div className="relative mx-auto max-w-2xl space-y-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-gold-200 ring-1 ring-inset ring-white/20">
          🌟 Bible Adventure for Kids &amp; Families
        </span>

        <h1 className="mx-auto text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Grow in the Word, <span className="text-gold-300">one level at a time.</span>
        </h1>

        <p className="mx-auto max-w-xl text-lg leading-8 text-white/80 sm:text-xl">
          Ten Bible-centered games, XP, streaks, and rewards that keep the whole family coming back. Pick a game
          and start playing.
        </p>

        <div className="flex justify-center pt-2">
          <Link
            href="/games"
            className="rounded-full bg-gold-400 px-8 py-4 text-lg font-bold text-royal-900 shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:bg-gold-300"
          >
            Start Playing →
          </Link>
        </div>
      </div>
    </section>
  );
}
