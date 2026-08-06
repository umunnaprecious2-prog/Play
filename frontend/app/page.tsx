import { Hero } from "../components/Hero";
import { FeatureGrid } from "../components/FeatureGrid";
import { HowItWorks } from "../components/HowItWorks";
import { GameCard } from "../components/GameCard";
import { LevelSystemPreview } from "../components/LevelSystemPreview";
import { AudienceHighlights } from "../components/AudienceHighlights";
import { FAQ } from "../components/FAQ";
import { Footer } from "../components/Footer";
import { PlayerSetupForm } from "../components/PlayerSetupForm";

const GAMES = [
  {
    title: "Bible Quiz Levels",
    description: "8 levels, 25 questions each, 10 points per question. Hints cost -2 points, up to 2 per question.",
    href: "/levels",
    accent: "border-royal-100",
    icon: "Q",
  },
  {
    title: "Memory Verse",
    description: "Practice verses with gentle repetition, hints, and simple progress tracking for kids.",
    href: "/memory-verse",
    accent: "border-meadow-100",
    icon: "V",
  },
  {
    title: "Word Search",
    description: "Find Bible words hidden in a letter grid, themed by category.",
    href: "/word-search",
    icon: "🔎",
    accent: "border-sky-100",
  },
  {
    title: "Scripture Puzzle",
    description: "Rebuild a scrambled verse, word by word, with hints when you're stuck.",
    href: "/scripture-puzzle",
    icon: "🧩",
    accent: "border-gold-100",
  },
  {
    title: "Flash Cards",
    description: "Quick-fire verse recall, built for daily practice.",
    href: "/flashcards",
    icon: "🗂️",
    accent: "border-sunrise-100",
  },
  {
    title: "Match the Verse",
    description: "Pair references with their verses in a memory-match game.",
    href: "/match-the-verse",
    icon: "🔗",
    accent: "border-meadow-100",
  },
  {
    title: "Bible Trivia",
    description: "Fast, wide-ranging trivia across the whole Bible, 15 seconds a question.",
    href: "/trivia",
    icon: "🎯",
    accent: "border-sky-100",
  },
  {
    title: "Bible Story Challenge",
    description: "Put key story events in the right order.",
    href: "/story-challenge",
    icon: "📜",
    accent: "border-royal-100",
  },
  {
    title: "Character Guessing Game",
    description: "Guess the Bible character from a series of clues.",
    href: "/who-am-i",
    icon: "❓",
    accent: "border-gold-100",
  },
  {
    title: "Daily Bible Challenge",
    description: "One fresh challenge a day to keep your streak alive.",
    href: "/daily-challenge",
    icon: "📅",
    accent: "border-sunrise-100",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <Hero />

        <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 text-center shadow-soft backdrop-blur sm:p-8">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">Our Mission</span>
          <h2 className="mx-auto mt-2 max-w-3xl text-2xl font-black text-slate-900 sm:text-3xl">
            Turning Bible study into something you look forward to
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Play brings faith, education, and gameplay together for kids and adults alike. It&apos;s built to be
            joyful and welcoming, so people keep coming back and growing in their knowledge of Scripture.
          </p>
        </section>

        <FeatureGrid />

        <HowItWorks />

        <section className="grid gap-3">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">The Arcade</span>
            <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Ten Bible-Centered Games, One Platform</h2>
            <p className="mx-auto mt-2 max-w-2xl text-base text-slate-600">
              All ten games are live today. Every verse quoted anywhere on Play is the King James Version, exactly as
              written.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {GAMES.map((game) => (
              <GameCard key={game.title} title={game.title} description={game.description} href={game.href} accent={game.accent} icon={game.icon} />
            ))}
          </div>
          <p className="pt-2 text-center text-sm text-slate-500">
            Just want a quick 5-question round instead?{" "}
            <a href="/quiz" className="font-semibold text-royal-600 hover:underline">
              Try Quick Practice
            </a>
          </p>
        </section>

        <LevelSystemPreview />

        <AudienceHighlights />

        <FAQ />

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]" id="start">
          <PlayerSetupForm />

          <div className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
            <h2 className="text-2xl font-black text-slate-900">Understand why an answer is right, not just whether you got it</h2>
            <div className="grid gap-3">
              {[
                "Every question comes with a short explanation and the Bible verse behind the answer.",
                "Answer at your own pace. Hints are there when you need them, never a punishment when you don't get it right.",
                "Earn XP, stars, badges, streaks, and avatar unlocks as you go.",
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-4 text-base leading-7 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
