"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-soft backdrop-blur sm:p-10">
      <div className="absolute inset-0 bg-hero-glow opacity-80" />
      <div className="relative grid gap-8 md:grid-cols-[1.3fr_0.9fr] md:items-center">
        <div className="space-y-5">
          <span className="inline-flex rounded-full bg-sunrise-100 px-4 py-2 text-sm font-semibold text-sunrise-700">
            Bible Adventure for Kids
          </span>
          <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Learn Scripture through bright, playful games.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
            Quiz, memory verse practice, XP rewards, badges, and cheerful progress all in one child-friendly experience.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link className="rounded-full bg-sunrise-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-sunrise-200 transition hover:bg-sunrise-600" href="/quiz">
              Start Quiz
            </Link>
            <Link className="rounded-full bg-sky-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600" href="/memory-verse">
              Memory Verse
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] bg-sky-50 p-5 shadow-soft animate-float">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Today&apos;s streak</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-4xl font-black text-slate-900">7</p>
                <p className="text-sm text-slate-600">days in a row</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                <p className="text-2xl font-black text-sunrise-500">320</p>
                <p className="text-sm text-slate-500">XP earned</p>
              </div>
            </div>
          </div>
          <div className="rounded-[1.75rem] bg-meadow-50 p-5 shadow-soft animate-pulseSoft">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-meadow-700">Next reward</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">⭐</div>
              <div>
                <p className="text-lg font-bold text-slate-900">Golden Lion Avatar</p>
                <p className="text-sm text-slate-600">Unlock at 500 XP and 5-day streak</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}