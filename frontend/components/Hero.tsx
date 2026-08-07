"use client";

import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-landing-hero p-8 shadow-glow sm:p-10 lg:p-14">
      <div className="relative mx-auto max-w-2xl space-y-6 text-center">
        <Image
          src="/logo.png"
          alt="Play logo"
          width={96}
          height={80}
          priority
          className="mx-auto h-20 w-auto animate-float drop-shadow-[0_10px_25px_rgba(245,165,36,0.35)]"
        />

        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-gold-200 ring-1 ring-inset ring-white/20">
          🌟 Bible Adventure for Kids &amp; Adults
        </span>

        <h1 className="mx-auto text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Grow in the Word, <span className="text-gold-300">one level at a time.</span>
        </h1>

        <p className="mx-auto max-w-xl text-lg leading-8 text-white/80 sm:text-xl">
          Ten Bible-centered games, XP, streaks, and rewards that keep you coming back. Sign in to set up your
          players and start playing.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 pt-2">
          <Link
            href="/account"
            className="rounded-full bg-gold-400 px-8 py-4 text-lg font-bold text-royal-900 shadow-lg shadow-gold-500/30 transition hover:-translate-y-0.5 hover:bg-gold-300"
          >
            Sign In to Play →
          </Link>
          <Link
            href="/download"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-white ring-1 ring-inset ring-white/25 transition hover:bg-white/20"
          >
            ⬇ Download for Android
          </Link>
        </div>
      </div>
    </section>
  );
}
