"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-landing-hero p-8 shadow-glow sm:p-10 lg:p-14">
      <div className="pointer-events-none absolute -right-10 -top-10 text-8xl opacity-20 animate-float" aria-hidden>
        📖
      </div>

      <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-gold-200 ring-1 ring-inset ring-white/20">
            🌟 Bible Adventure for Kids &amp; Families
          </span>

          <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Grow in the Word, <span className="text-gold-300">one level at a time.</span>
          </h1>

          <p className="max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">
            8 Bible Quiz levels, 200+ questions, and hints whenever you&apos;re stuck. Earn XP, build streaks, and
            unlock badges and avatars that keep the whole family coming back.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              className="rounded-full bg-gold-400 px-7 py-3.5 text-base font-bold text-royal-900 shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:bg-gold-300"
              href="/levels"
            >
              Start Bible Quiz →
            </Link>
            <Link
              className="rounded-full bg-white/10 px-7 py-3.5 text-base font-bold text-white ring-1 ring-inset ring-white/30 transition hover:-translate-y-0.5 hover:bg-white/20"
              href="/memory-verse"
            >
              Try Memory Verse
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2 text-sm text-white/60">
            <span><span className="font-black text-white">8</span> levels</span>
            <span><span className="font-black text-white">200+</span> questions</span>
            <span><span className="font-black text-white">2</span> hints/question</span>
            <span><span className="font-black text-white">∞</span> encouragement</span>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] bg-white/10 p-5 shadow-soft ring-1 ring-inset ring-white/15 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-200">Bible Quiz Levels</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-4xl font-black text-white">Lvl 1</p>
                <p className="text-sm text-white/60">of 8 unlocked to start</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-right ring-1 ring-inset ring-white/15">
                <p className="text-2xl font-black text-gold-300">10 pts</p>
                <p className="text-sm text-white/60">per question</p>
              </div>
            </div>
          </div>
          <div className="rounded-[1.75rem] bg-white/10 p-5 shadow-soft ring-1 ring-inset ring-white/15 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-200">Stuck on a question?</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl ring-1 ring-inset ring-white/15">
                💡
              </div>
              <div>
                <p className="text-lg font-bold text-white">Use a hint</p>
                <p className="text-sm text-white/60">-2 points, up to 2 per question</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
